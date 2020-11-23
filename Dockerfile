#FROM node:14 as builder

#ARG ENV
#ENV ENV=$ENV

#WORKDIR /src

#COPY package.json .

#RUN npm install

#COPY . .

#RUN npm run build

FROM docker-registry.umusic.com/devops/nginx-aws:v0.0.1 as app
WORKDIR /usr/share/nginx/html
ARG S3_BUCKET
ARG AWS_IAM_ROLE_ARN
ARG CLOUDFRONT_DISTRIBUTION_ID

ENV S3_BUCKET=$S3_BUCKET
ENV AWS_IAM_ROLE_ARN=$AWS_IAM_ROLE_ARN
ENV CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID

#COPY --from=builder /src/ /usr/share/nginx/html/
COPY . /usr/share/nginx/html/

ENTRYPOINT [ "/usr/share/nginx/html/devops/scripts/s3-sync" ]
#CMD [ "nginx", "-g", "daemon off;" ]
#ENTRYPOINT [ "./docker-entrypoint.sh" ]
