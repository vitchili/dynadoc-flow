#!/bin/bash
echo "Criando bucket S3 'Files'..."

awslocal s3 mb s3://files
awslocal s3 mb s3://photos