from plistlib import UID
from django.db import models

# Create your models here.
'''
    1 - Create Database Model (RoomMember)| store username , uid , room_name
    2 - On join create RoomMember in database
    3 - On handleUserJoin event , query db RoomMember name by uid and room_name
    4 - On leave delete RoomMember
'''
class RoomMember(models.Model):
    name = models.CharField(max_length=200)
    uid = models.CharField(max_length=200)
    room_name = models.CharField(max_length=200)

    def  __str__(self):
        return self.name