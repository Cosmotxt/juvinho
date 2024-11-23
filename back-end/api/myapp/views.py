from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Query
from .serializer import ChatSerializer
from .services import Chatbot

            
class ChatbotView(APIView):
    def post(self, resquest, *args, **kwargs):
        query = resquest.data.get('input')
        if not query:
            return Response({"error": "A query é obrigatória."}, status=400)

        chatbot_service = Chatbot(query=query)
        answer = chatbot_service.process()
        return Response({"answer": answer}, status=status.HTTP_200_OK)