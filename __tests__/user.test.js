import mongoose        from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Usermodel from '../model/user.model';

let mongoServer;

export const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const disconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};


beforeAll(async () => await connect());
afterAll(async  () => await disconnect());
afterEach(async () => await clearCollections());


describe('user model test',()=>{
    test('add new user',async () => {
        const user = await Usermodel.create({
            name:"harsh",
            email:'123@gmail.com',

            
        })

        expect(user.name).toBe("harsh")
        expect(user.email).toBe("123@gmail.com")

    })

    test("shold require the feilds (name , email)if not provided",async ()=>{
        await Usermodel.create({name:"doremon"}).catch((err)=>{
            expect(err.message).toBe('User validation failed: email: Path `email` is required.');
        });
    })
})