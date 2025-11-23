import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';

class PineconeService {
  private static instance: PineconeService;
  private pinecone: Pinecone;
  private habitHistoryIndex: string = process.env.PINECONE_INDEX_NAME || 'habit-history';

  private constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  public static getInstance(): PineconeService {
    if (!PineconeService.instance) {
      PineconeService.instance = new PineconeService();
    }
    return PineconeService.instance;
  }

  // Initialize index only when first needed per function execution
  public async ensureIndexExists() {
    try {
      // List existing indexes
      const indexes = await this.pinecone.listIndexes();

      // Check if our index exists
      const habitHistoryIndexExists = indexes.indexes?.some(
        (index) => index.name === this.habitHistoryIndex
      );

      // Create index if it doesn't exist
      if (!habitHistoryIndexExists) {
        console.log('Creating Pinecone index...');
        await this.pinecone.createIndex({
          name: this.habitHistoryIndex,
          dimension: 1536, // Standard dimension for OpenAI embeddings, adjust as needed
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: process.env.PINECONE_CLOUD_REGION || 'us-east-1'
            }
          }
        });
        console.log('Pinecone index created successfully');
      } else {
        console.log('Pinecone index already exists');
      }
    } catch (error) {
      console.error('Error ensuring Pinecone index exists:', error);
      throw error;
    }
  }

  public async upsertHabitData(userId: string, habitId: string, inputData: any) {
    try {
      // Ensure index exists before upserting
      await this.ensureIndexExists();

      // Create an embedding from the input data (in a real app, you'd use an AI model to create embeddings)
      // For now, we'll simulate this with a basic representation
      const embedding = this.createEmbeddingFromData(inputData);

      // Create a unique ID for this record
      const recordId = `habit_${habitId}_${Date.now()}_${uuidv4().substring(0, 8)}`;

      // Prepare the record for upsert
      const record = {
        id: recordId,
        values: embedding, // This would normally be a vector of numbers from an AI model
        metadata: {
          userId,
          habitId,
          ...inputData,
          timestamp: new Date().toISOString()
        }
      };

      // Get the index
      const index = this.pinecone.Index(this.habitHistoryIndex);

      // Upsert the record
      await index.upsert([record]);

      console.log(`Habit data upserted successfully for habit ${habitId}`);

      return recordId;
    } catch (error) {
      console.error('Error upserting habit data to Pinecone:', error);
      throw error;
    }
  }

  public async querySimilarHabits(userId: string, habitId: string, topK: number = 5) {
    try {
      // Ensure index exists before querying
      await this.ensureIndexExists();

      // In a real implementation, we would create an embedding for the query
      // For now, we'll use a dummy embedding
      const queryVector = Array(1536).fill(0.1); // Placeholder for actual embedding

      // Get the index
      const index = this.pinecone.Index(this.habitHistoryIndex);

      // Query for similar records
      const queryResponse = await index.query({
        vector: queryVector,
        topK: topK,
        filter: { userId }, // Filter to only user's data
        includeMetadata: true
      });

      console.log(`Found ${queryResponse.matches.length} similar habits for user ${userId}`);

      return queryResponse.matches;
    } catch (error) {
      console.error('Error querying similar habits from Pinecone:', error);
      throw error;
    }
  }

  public async searchHabitHistory(userId: string, searchText: string, topK: number = 10) {
    try {
      // Ensure index exists before searching
      await this.ensureIndexExists();

      // In a real implementation, we would use an AI model to create an embedding from the search text
      // For now, we'll use a dummy embedding
      const queryVector = Array(1536).fill(0.1); // Placeholder for actual embedding

      // Get the index
      const index = this.pinecone.Index(this.habitHistoryIndex);

      // Query for similar records based on the search text
      const queryResponse = await index.query({
        vector: queryVector,
        topK: topK,
        filter: { userId }, // Filter to only user's data
        includeMetadata: true
      });

      console.log(`Found ${queryResponse.matches.length} records matching search for user ${userId}`);

      return queryResponse.matches;
    } catch (error) {
      console.error('Error searching habit history in Pinecone:', error);
      throw error;
    }
  }

  // Helper method to create a basic embedding from input data
  // In a real application, this would be replaced with actual AI model embeddings
  private createEmbeddingFromData(data: any): number[] {
    // This is a simplified approach - in a real app, you'd use an AI model to generate actual embeddings
    // For now, we'll create a basic numeric representation based on the data
    
    // Create a string representation of the data
    const dataString = JSON.stringify(data);
    
    // Create a simple hash-based vector (not a real embedding, just for demonstration)
    const vector: number[] = new Array(1536).fill(0);
    
    for (let i = 0; i < dataString.length; i++) {
      const charCode = dataString.charCodeAt(i);
      const idx = i % 1536;
      vector[idx] = ((vector[idx] || 0) + charCode) % 1;
    }
    
    return vector;
  }

  public async deleteHabitData(userId: string, habitId: string) {
    try {
      // Ensure index exists before deletion
      await this.ensureIndexExists();

      // Get the index
      const index = this.pinecone.Index(this.habitHistoryIndex);

      // List all vectors for this user's specific habit and delete them
      // In practice, you'd want to implement more efficient deletion methods
      // For now, we'll use a filtering approach if supported, or we'd need to track IDs separately

      console.log(`Habit data deletion would occur for habit ${habitId}`);
    } catch (error) {
      console.error('Error deleting habit data from Pinecone:', error);
      throw error;
    }
  }
}

export default PineconeService;