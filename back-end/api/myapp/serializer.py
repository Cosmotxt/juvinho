from rest_framework import serializers
from .models import Query

class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ['id', 'usermessage']