import json
import boto3
import requests
from requests_aws4auth import AWS4Auth

region = 'us-east-1'
service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)


host = 'https://vpc-photos-7a4y7c7ob2k6xmufkzaxmhofdy.us-east-1.es.amazonaws.com'
index = 'photo_index'
type = 'photo'
url = host + '/' + index + '/' + type
headers = { "Content-Type": "application/json" }


def lambda_handler(event, context):
    client = boto3.client('rekognition')

    def extract_info(event):
        """
        Notice there must be no blank space in image_key, they will be replace to +
        """
        put_info = event.get('Records')[-1]
        bucket_key = put_info.get('s3').get('bucket').get('name')
        image_key = put_info.get('s3').get('object').get('key')
        time_key =  put_info.get('eventTime')
        return bucket_key, image_key, time_key

    def extract_labels(label_res):
        labels = label_res.get("Labels")
        res = list()
        for label in labels:
            res.append(label.get("Name"))
        return res


    try:
        bucket_key, image_key, time_key = extract_info(event)
        search_idx = {'S3Object': {'Bucket': bucket_key, 'Name': image_key}}
        label_res = client.detect_labels(Image=search_idx)
    except:
        bucket_key, image_key, time_key = extract_info(event)
        image_key = image_key.replace('+', ' ')  # replace +
        search_idx = {'S3Object': {'Bucket': bucket_key, 'Name': image_key}}
        label_res = client.detect_labels(Image=search_idx)

    json_object = {
        "objectKey": image_key,
        "bucket": bucket_key,
        "createdTimestamp": time_key,
        "labels": extract_labels(label_res)
    }  # this is the object to store in ES

    r = requests.post(url, auth=awsauth, json=json_object, headers=headers)
    print('Sucessfully add one to ES')
    print(json_object)

    return json_object
