import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda'

const lambdaFunction = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    body: 'Its a string',
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
    }
  }
}

export { lambdaFunction }
