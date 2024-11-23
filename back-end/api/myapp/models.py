from django.db import models

class Query(models.Model):
    usermessage = models.TextField()

    def __inti__(self):
        return self.name
