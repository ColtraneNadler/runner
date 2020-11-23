import json
import boto3
import mimetypes
client = boto3.client('cloudfront') #CFClient for boto 
import time
import urllib
import os
from pprint import pprint

def setObjectMimeType(event, objectname):
    bucketName = event['Records'][0]['s3']['bucket']['name']
    mimeType = ""
    if os.path.splitext(objectname)[-1] == '.bin':
        mimeType = "application/eot"
    elif os.path.splitext(objectname)[-1] == '.gltf':
        mimeType = "application/json"
    else:
        mimeTypes = mimetypes.guess_type(objectname)
        mimeType = mimeTypes[0] or "application/octet-stream"
    s3 = boto3.resource('s3')
    object = s3.Object(bucketName, objectname)
    print ("mimeType check:", bucketName+"/"+objectname, "current:", object.content_type, "updated:", mimeType)
    if not object.metadata or not object.metadata['mimetype']:
        object.copy_from(CopySource={'Bucket': bucketName,
                            'Key': objectname},
                            MetadataDirective="REPLACE",
                            ContentType=mimeType,
                            CacheControl="public, max-age=3600",
                            Metadata={
                                "mimetype": mimeType
                            }
                        )
    
                   
                    
def lambda_handler(event, context):
    print("Received event: " + json.dumps(event)) #Lambda event handler for boto3 + Print events on CW logs 
    objectname = event['Records'][0]['s3']['object']['key'] #extracts the keyname/path name from the s3 event log
    setObjectMimeType(event, objectname)
    ObjectListToInvalidate= []
    ObjectListToInvalidate.append(objectname)
    timestring = str(time.time())
    timestringSecond = (timestring.split("."))
    print ("timestringSecond", timestringSecond[0])
    mystr1 = ObjectListToInvalidate[0]
    print ("mystr1", mystr1)
    DistributionIds = {"EWNZ40JL3UWOH"}
    for DistributionId in DistributionIds:
        
        response = client.create_invalidation(
        DistributionId= DistributionId,  
        InvalidationBatch={
            'Paths': {
                'Quantity': 1,
                'Items': [
                    mystr1,
                ]
            },
            'CallerReference': timestringSecond [0]
        }
    )
