# console.log("Loading LF0");

# var AWS = require('aws-sdk');

# exports.handler = function(event, context, callback) {
  
#  AWS.config.region = 'us-east-1';
#  var lexruntime = new AWS.LexRuntime();
#  var params = {
#       botAlias: process.env.BOT_ALIAS,
#       botName: process.env.BOT_NAME,
#       inputText: event.messages[0]['unstructured']['text'],
#       userId: event.messages[0]["unstructured"]['id'],
#       sessionAttributes: {
#       }
#     };
#  lexruntime.postText(params, function(err, data) {
#    if(err){
#      callback(err, "Error occurs!");
#    }
#    else{
#     var return_messages = 
#    {
#      "messages": [
#        {
#          "type": event.messages[0]["type"],
#          "unstructured": {
#            "id": event.messages[0]["unstructured"]["id"],
#            "text": data.message,
#            "timestamp": event.messages[0]["unstructured"]['timestamp']
#          }
#        }
#      ]
#    }
#      callback(null, return_messages);
#    }
     
#  });
 
#   // callback(null, "APP under development...........");
# };

from __future__ import print_function # Python 2/3 compatibility

import sys
sys.path.append("./packages")

import json
import boto3
import os
# import requests
import botocore.vendored.requests as requests
from requests_aws4auth import AWS4Auth

# region = 'us-east-1'
# service = 'es'
# credentials = boto3.Session().get_credentials()
# awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)

region = 'us-east-1'
service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)


host = 'https://vpc-photos-7a4y7c7ob2k6xmufkzaxmhofdy.us-east-1.es.amazonaws.com'
index = 'photo_index'
# type = 'photo'
url = host + '/' + index + '/_search'
headers = { "Content-Type": "application/json" }



def lambda_handler(event, context):
    # text = event['messages'][0]['unstructured']['text']
    text = event['q']
    print(text)
    # userId = event['messages'][0]['unstructured']['id']
    client = boto3.client('lex-runtime')
    response = client.post_text(
        botName=os.environ['BOT_NAME'],
        botAlias=os.environ['BOT_ALIAS'],
        userId='1111',
        inputText=text
        # version='$LATEST'
    )
    # print(response)
    responseText = response['message']
    responseMessages = dict()
    responseMessages["messages"] = [{
        'type': 'string',
        'unstructured': {
            'id': 'string',
            'text': responseText,
            'timestamp': 'string'}}]
    
    response_slots = response['slots'] 
    auth = AWS4Auth(os.environ['access_key'], os.environ['secret_key'], 'us-east-1', 'es')
    
    print(response_slots)
    word_list = list()
    for key, value in response_slots.items():
        if value:
            word_list.append(value)
    word_list = set(word_list)
    print(word_list)
    res = dict()
    
    for word in word_list:
    # response_es = requests.get("https://vpc-photos-7a4y7c7ob2k6xmufkzaxmhofdy.us-east-1.es.amazonaws.com/predictions/_search?q=%s" % response_slots["ObjectOne"], auth=auth)
        query = {
            "size": 5,
            "query": {
                "multi_match": {
                    "query": word,
                    "fields": ["labels"]
                }
            }
        }
    
        r = requests.get(url, auth=awsauth, headers=headers, data=json.dumps(query))
        result = json.loads(r.text)["hits"]['hits']
    
    # s3_client = boto3.client('s3')
    
        for each_res in result:
            # s3_response_object = s3_client.get_object(Bucket=each_res['_source']['bucket'], Key=each_res['_source']['objectKey'])
            tmp_url = each_res['_source']['bucket'] + '/' + each_res['_source']['objectKey']
            # object_content = s3_response_object['Body'].read()
            res[each_res['_source']['objectKey'].split('/')[-1]] = 'https://s3.amazonaws.com/' + tmp_url.replace(' ', "+")
            
    print(res)
    return {
        "statusCode": 200,
        "body": res,
        # "body": text
    }