import * as core from '@aws-cdk/core';
import * as s3 from "@aws-cdk/aws-s3";
import * as cr from "@aws-cdk/custom-resources";
import * as apiGateway from "@aws-cdk/aws-apigateway";

export interface FrontendConfigProps extends core.NestedStackProps {
    siteBucket: s3.Bucket;
    api: apiGateway.RestApi;
}

export class FrontendConfig extends core.NestedStack {
  constructor(scope: core.Construct, id: string, props: FrontendConfigProps) {
    super(scope, id);

    new cr.AwsCustomResource(this, "WriteS3ConfigFile", {
        onUpdate: {
            service: "S3",
            action: "putObject",
            parameters: {
                Body: JSON.stringify({
                    API_URL: props.api.url,
                }),
                Bucket: props.siteBucket.bucketName,
                Key: "config.json",
            },
            physicalResourceId: cr.PhysicalResourceId.of(
                Date.now().toString()
            ), // always write this file
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
            resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
    });
  }
}