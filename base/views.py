from pickle import GET
from plistlib import UID
from random import random
from unicodedata import name
from django.shortcuts import render 
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
import random
import time
import json
from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

def getToken(request):
    appId = '6c6ae481d38044e597727837c1b84675'
    appCertificate = 'e902c23c1357404b89fe1bd6302f080c'
    channelName = request.GET.get('channel')
    uid = random.randint(1 , 230)
    expirationTimeInSeconds = 3600*12
    currentTimeStamp = time.time()
    privilegeExpiredTs = expirationTimeInSeconds + currentTimeStamp
    role = 1
    #Build token with uid
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token , 'uid':uid}, safe=False)
def lobby(request):
    return render(request , 'base/lobby.html')
def room(request):
    return render(request , 'base/room.html')

@csrf_exempt
def createMember(request):
    data = json.loads(request.body)#getting the data from stream.js
    # quering the data base# storing the user in database
    member , created = RoomMember.objects.get_or_create(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name'],
    )
    
    return JsonResponse({'name':data['name']} , safe = False)#return to fetch funtion in streams.js

def getMember(request) :
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')
    # searching the data base by room_name and uid 
    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name,
    )
    name = member.name
    return JsonResponse({'name':member.name}, safe=False)

@csrf_exempt
def deleteMember(request):
    
    data = json.loads(request.body)

    member = RoomMember.objects.get(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name'],
    )
    member.delete()
    return JsonResponse('Member was deleted', safe=False)

