from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_groq import ChatGroq
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage
from langchain.schema import AIMessage
from pinecone import Pinecone
from dotenv import load_dotenv
import os

# Carregar variáveis de ambiente
load_dotenv()



class ChatBotService:
    def __init__(self, query):
        """Inicializa o serviço do chatbot."""
        self._setup_environment()
        self.llm = self._setup_llm()
        self.vector_store = self._setup_vector_store()
        self.query = query


    def _setup_environment(self):
        """Configura as variáveis de ambiente."""
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")
        os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
        os.environ["LANGCHAIN_PROJECT"] = "juvinho"
        os.environ["groq_api_key"] = os.getenv("GROQ_API_KEY")
        os.environ["api_key"] = os.getenv("PINECONE_API_KEY")
    def _setup_llm(self):
        """Configura o modelo de linguagem."""
        return ChatGroq(temperature=0, model_name="llama-3.1-8b-instant")

    def _setup_vector_store(self):
        """Configura o armazenamento vetorial."""
        pc = Pinecone()
        index = pc.Index('juvibot')
        embeddings = HuggingFaceEmbeddings()
        return PineconeVectorStore(index=index, embedding=embeddings)

    def _retrieve_tool(self):
        """Define a ferramenta de recuperação."""
        @tool(response_format="content_and_artifact")
        def retrieve(query: str):
            """define a ferramenta de retrieval"""
            retrieved_docs = self.vector_store.similarity_search(query, k=2)
            serialized = "\n\n".join(
                f"Source: {doc.metadata}\nContent: {doc.page_content}"
                for doc in retrieved_docs
            )
            return serialized, retrieved_docs
        return retrieve

    def process(self):
        """Constrói o grafo do chatbot."""
        retrieve = self._retrieve_tool()

        def query_or_respond(state: MessagesState):
            llm_with_tools = self.llm.bind_tools([retrieve])
            response = llm_with_tools.invoke(state["messages"])
            return {"messages": [response]}

        def generate(state: MessagesState):
            recent_tool_messages = [
                message for message in reversed(state["messages"])
                if message.type == 'tool'
            ][::-1]

            docs_content = '\n\n'.join(doc.content for doc in recent_tool_messages)
            system_message = (
                f"""
                Você é um assistente da Rede Cuca chamado Juvinho, o mascote do cuca.
                Você responde perguntas de forma direta, porém carismática.
                Se você não sabe responder a pergunta, você diz que não sabe.
                Você usa o contexto dado para responder as perguntas.

                Context:
                {docs_content}
                """
            )

            conversation_messages = [
                message for message in state['messages']
                if message.type in ('human', 'system')
                or (message.type == 'ai' and not message.tool_calls)
            ]
            prompt = [SystemMessage(system_message)] + conversation_messages
            response = self.llm.invoke(prompt)
            return {'messages': [response]}

        graph_builder = StateGraph(MessagesState)
        graph_builder.add_node(query_or_respond)
        graph_builder.add_node(ToolNode([retrieve]))
        graph_builder.add_node(generate)
        graph_builder.set_entry_point("query_or_respond")
        graph_builder.add_conditional_edges(
            "query_or_respond",
            tools_condition,
            {END: END, "tools": "tools"}
        )
        graph_builder.add_edge("tools", "generate")
        graph_builder.add_edge("generate", END)

        memory = MemorySaver()
        graph = graph_builder.compile(checkpointer=memory)

        config = {"configurable": {"thread_id": "1"}}
        input_message = self.query

        for step in graph.stream(
        {"messages": [{"role": "user", "content": input_message}]},
            stream_mode="values",
            config=config
        ):
            def extrair_ultimo_aimessage(data):
                mensagens = data.get('messages', [])
                # Filtra somente os AIMessage
                aimessages = [msg for msg in mensagens if isinstance(msg, AIMessage)]
                # Retorna o último AIMessage, se existir
                return aimessages[-1].content if aimessages else None
             
            # answer = step["messages"][-1].pretty_print()
            ai_message = extrair_ultimo_aimessage(step)

        return ai_message