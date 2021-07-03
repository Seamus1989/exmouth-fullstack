
import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';

interface Props {
    partitionKey: ddb.Attribute;
    lambda:lambda.NodejsFunction;
    key: string;
}
export class DatabaseTable extends cdk.Construct {

    constructor(scope: cdk.Construct, id: string, props: Props)  {
        super(scope, id);
        const table = new ddb.Table(this, id, {
            billingMode: ddb.BillingMode.PAY_PER_REQUEST,
            partitionKey: props.partitionKey,
            removalPolicy:cdk.RemovalPolicy.DESTROY,
          });
          table.grantFullAccess(props.lambda)
          props.lambda.addEnvironment(props.key, table.tableName);
    }
}