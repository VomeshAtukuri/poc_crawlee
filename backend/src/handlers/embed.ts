import { AzureOpenAIEmbeddings } from "@langchain/openai";
import * as dotenv from 'dotenv';

dotenv.config();

const AZURE_OPENAI_API_INSTANCE_NAME = process.env.AZURE_OPENAI_API_INSTANCE_NAME;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_API_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME;
const AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME 

export const embeddings = new AzureOpenAIEmbeddings({
  azureOpenAIApiKey: AZURE_OPENAI_API_KEY,
  azureOpenAIApiInstanceName: AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiVersion: AZURE_OPENAI_API_VERSION,
  azureOpenAIApiDeploymentName: AZURE_OPENAI_API_DEPLOYMENT_NAME,
  azureOpenAIApiEmbeddingsDeploymentName: AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
});

export const embedText = async (text: string) => {
  const [vector] = await embeddings.embedDocuments([text]);
  return vector as number[];
};

