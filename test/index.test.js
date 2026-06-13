import axios from "axios";

function sum(a, b) {
  return a + b;
}

const BACKEND_URL = "http://localhost:3000"

describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "aman" + Math.random();
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(response.statusCode).toBe(200);

        const updatedRequest = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(updatedRequest.statusCode).toBe(400)
    })

    test('Signup request fails if username is empty', async () => {
        const username = "aman" + Math.random();
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password,
            type: "admin" // or user
        })

        expect(response.statusCode).toBe(400);
    })

    test('Signin succeeds if username and password are correct', async () => {
        const username = "aman" + Math.random();
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin" // or user
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    })

    test('Signin fails if username and password are incorrect', async () => {
        const username = "amankarn" + Math.random();
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin" // or user
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "wrongUsername",
            password
        })

        expect(response.statusCode).toBe(403);
    })
})

describe("User informatino endpoints", () => {
    let token = "";
    let avatarId = "";
    
    beforeALl(async () => {
        const username = `amnkarn-${Math.random()}`;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        // token = response.data.token
        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy"
        })

        avatarId = avatarResponse.data.avatarId;
    })

    test("User cannot update their information with wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123213",
        })

        expect(response.statusCode).toBe(400)
    })

    test("User can update their information with right avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123213",
        })

        expect(response.statusCode).toBe(400)
    })
})