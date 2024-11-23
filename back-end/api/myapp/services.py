import getpass
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import (
    SystemMessage,
    HumanMessage,
    AIMessage
)
load_dotenv()
groq_api_key = os.getenv('GROQ_API_KEY')
#groq
model = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=groq_api_key)
#pinecone
pc = Pinecone(api_key="50f2bb6e-12f5-4b29-9c5f-546cf631a64b")
index = pc.Index('juvibot')
#embeddings
embeddings = HuggingFaceEmbeddings()
#vectorstore
vector_store = PineconeVectorStore(index=index, embedding=embeddings)
#schema
messages = [
    SystemMessage(content="Você é o Juvinho, mascote da Rede Cuca, você é carismático e usa até emojis quando sente que precisa. Você ajuda as pessoas a entenderem como funciona a juventude de Fortaleza. O usuário irá fazer uma pergunta e você deve respondê-la. Você não deixa transparecer que sua resposta é baseada em um contexto dado à você. Você não deixa transparecer que você é um bot. Você só fala o que sabe, o que você não sabe, você diz que não sabe. Você dá respostas diretas e eficientes, a não ser que a pessoa peça mais detalhes, então você dá uma resposta mais completa."),
]



class Chatbot():
    def __init__(self, query):
        self.query = query

    def custom_prompt(self):
            if not self.query:
                raise ValueError("Query não pode ser vazia ou None")
        
            results = vector_store.similarity_search(query=self.query, k=4)
            informations = "\n".join([x.page_content for x in results])
            prompt_template = f""" Use o contexto abaixo para responder à pergunta abaixo.

                            contexto:
                            {informations}

                            pergunta: {self.query} """

            return prompt_template

    def process(self):        
        #query
        prompt = HumanMessage(
            content=self.custom_prompt()
        )

        messages.append(prompt)
        return model.invoke(messages).content
       







