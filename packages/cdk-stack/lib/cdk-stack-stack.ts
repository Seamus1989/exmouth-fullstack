import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import { Runtime } from '@aws-cdk/aws-lambda';
import { Duration, Expiration } from '@aws-cdk/core';
import { resolversArray } from './consts';

const one = Duration.days(365)
const yes = cdk.Expiration.after(cdk.Duration.days(365))
export class AppsyncCdkAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Creates the AppSync API
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-notes-appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(Duration.days(365))
          }
        },
      },
      xrayEnabled: true,
    });

    const myLambda = new lambda.NodejsFunction(this, 'my-lambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..','..','lambda', 'build', 'index.js'),
      handler: 'lambdaFunction',
    })

    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', myLambda);

    resolversArray.forEach(({fieldName, typeName}) => {
      lambdaDs.createResolver({
        fieldName, typeName
      })
    });

    const fishTable = new ddb.Table(this, 'CDKFishTable', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });

    fishTable.grantFullAccess(myLambda)

    myLambda.addEnvironment('NOTES_TABLE', fishTable.tableName);

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
     value: api.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });
  }
}
Expiration
Duration