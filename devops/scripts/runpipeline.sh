#!/bin/bash

set -e
export CLUSTER=`echo $ENVIRONMENT | cut -d/ -f1`
export NAMESPACE=`echo $ENVIRONMENT | cut -d/ -f2`
export ENV=`echo $NAMESPACE | cut -d- -f2`

# USER_DATA = base64({"S3_BUCKET": "", "AWS_IAM_ROLE_ARN": "", "CLOUDFRONT_DISTRIBUTION_ID": "", "ENV": ""})
USER_DATA_DEV=`echo '{"S3_BUCKET":"awsa4-digital-marketing-bieber-runner-dev","AWS_IAM_ROLE_ARN":"arn:aws:iam::521064524905:role/gatsby-cicd-role","CLOUDFRONT_DISTRIBUTION_ID":"EWNZ40JL3UWOH","ENV":"dev"}' | base64`
USER_DATA_PROD=`echo '{"S3_BUCKET":"awsa6-digital-marketing-bieber-runner-prod","AWS_IAM_ROLE_ARN":"arn:aws:iam::474656651976:role/gatsby-cicd-role","CLOUDFRONT_DISTRIBUTION_ID":"E20PTI9WYVEWY5","ENV":"prod"}' | base64`

if [[ $ENV == "prod" ]]; then
    USER_DATA="$USER_DATA_PROD"
else
    USER_DATA="$USER_DATA_DEV"
fi

jq ".Git.Ref=\"$GIT_REF\"|.Git.Revision=\"$GIT_COMMIT\"|.Image.Tag=\"$GIT_COMMIT\"|.Config.UserData=\"$USER_DATA\"|.K8S.ClusterName=\"$CLUSTER\"|.K8S.Namespace=\"$NAMESPACE\"" \
    devops/tekton/trigger.json > trigger.json

cat trigger.json

EVENT_ID=`curl http://el-build-pipeline-listener.tekton-pipelines.svc.cluster.local:8080/v1/$PIPELINE \
    -d @trigger.json | jq -r '.eventID'`

echo Execution Logs: https://tekton.devops.umgapps.com/#/pipelineruns?labelSelector=triggers.tekton.dev%2Ftriggers-eventid%3D$EVENT_ID
