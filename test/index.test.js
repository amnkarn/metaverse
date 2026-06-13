import axios from "axios";

function sum(a, b) {
  return a + b;
}

const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001";

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
    
    beforeAll(async () => {
        const username = `amnkarn-${Math.random()}`;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "user"
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
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        avatarId = avatarResponse.data.avatarId;
    })

    test("User cannot update their metadata with wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123213",
        }, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })

        expect(response.statusCode).toBe(400)
    })

    test("User can update their information with right avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: avatarId,
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(200)
    })

    test("User is not able to update their metadata if auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId,
        })

        expect(response.statusCode).toBe(403);
    })
})

describe("User avatar information", () => {
    let avatarId = "";
    let token = "";
    let userId = "";

    beforeAll(async () => {
        const username = `amnkarn-${Math.random()}`;
        const password = "123456";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        userId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy"
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        avatarId = avatarResponse.data.avatarId;
    })

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists the recently created avatars ", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);

        const currentAvatar = response.data.avatars.find(x => {
            x.find == avatarId;
        })
        expect(currentAvatar).toBeDefined();
    })
})

describe("Space information", () => {
    let mapId = ""
    let elementId1 = "";
    let elementId2 = "";
    let adminToken = "";
    let adminId = "";
    let userToken;
    let userId;

    beforeAll(async () => {
        const username = `amnkarn-${Math.random()}`;
        const password = "123456";

        //admin signup & signin
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminToken = response.data.token;

        //user signup and signin
        const userSignup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })

        userId = userSignup.data.userId;

        const userSignin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken = response.data.token;

        //creat element & map
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        elementId1 = element1.data.id;
        elementId2 = element2.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnail: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            name: "100 person interview room",
            defaultElements: [{
                    elementId: elementId1,
                    x: 20,
                    y: 20
                }, {
                    elementId: elementId1,
                    x: 18,
                    y: 20
                }, {
                    elementId: elementId2,
                    x: 19,
                    y: 20
                }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        mapId = mapResponse.id;
    })

    test("User is able to create space", async () => {
        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
            mapId: mapId
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(space.statusCode).toBe(200);
        expect(space.data.spaceId).toBeDefined();
    })

    test("User is able to create space without map id(empty space)", async () => {
        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(space.data.spaceId).toBeDefined();
    })

    test("User is not able to create space without mapId and dimension", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User is not able to delete a space that does not exists", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExists`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("User is able to delete a space that does exists", async () => {
        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${space.data.spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(200);
    })

    test("User should not be able to delete a space that is created by other user", async () => {
        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${space.data.spaceId}`, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        expect(response.statusCode).toBe(400);
    })

    test("Admin have no space initially", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                "Authorization": `Bearer ${adminId}`
            }
        });

        expect(response.data.spaces.length).toBe(0);
    })

    test("Admin has gets once space after", async () => {
        const spaceCreatedResponse = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })
        
        const filterSpace = response.data.spaces.find(x => {
            x.id === spaceCreatedResponse.data.spaceId;
        })

        expect(response.data.spaces.length).toBe(1);
        expect(filterSpace).toBeDefined();
    })
})

describe("Arena endpoint", () => {
    let mapId = ""
    let elementId1 = "";
    let elementId2 = "";
    let adminToken = "";
    let adminId = "";
    let userToken;
    let userId;
    let spaceId;

    beforeAll(async () => {
        const username = `amnkarn-${Math.random()}`;
        const password = "123456";

        //admin signup & signin
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminToken = response.data.token;

        //user signup and signin
        const userSignup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })

        userId = userSignup.data.userId;

        const userSignin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken = response.data.token;

        //creat element & map
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        elementId1 = element1Response.data.id;
        elementId2 = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnail: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            name: "100 person interview room",
            defaultElements: [{
                    elementId: elementId1,
                    x: 20,
                    y: 20
                }, {
                    elementId: elementId1,
                    x: 18,
                    y: 20
                }, {
                    elementId: elementId2,
                    x: 19,
                    y: 20
                }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        mapId = mapResponse.id;

        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
            mapId: mapId
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        spaceId = space.spaceId;
    })

    test("Incorrect spaceId returns a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/fds546546`);
        expect(response.statusCode).toBe(400);
    })

    test("Correct space id returns all the elements", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`);
        expect(response.dimensions).toBe("100x200");
        expect(response.data.elements.length).toBe(3);
    })

    test("Delete endpoint is able to delete an element", async () => {
        const space = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`);

        const response = await axios.get(`${BACKEND_URL}/api/v1/space/element`, {
            spaceId,
            elementId: space.elements[0].id,
        });

        const updatedSpace = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`);

        expect(updatedSpace.data.elements.length).toBe(2);
    })

    test("Adding an element works as expected", async () => {
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": elementId1,
            "spaceId": spaceId,
            "x": 50,
            "y": 20
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(newResponse.elements.length).toBe(3)
    })

    test("Adding an element fails if the elements lies outside the dimensions", async () => {
        const reponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": elementId1,
            "spaceId": spaceId,
            "x": 500500,
            "y": 210000
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400)
    })
})

describe("Admin endpoints", () => {
    let adminToken = "";
    let adminId = "";
    let userToken;
    let userId;

    beforeAll(async () => {
        const username = `amnkarn-${Math.random()}`;
        const password = "123456";

        //admin signup & signin
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminToken = response.data.token;

        //user signup and signin
        const userSignup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })

        userId = userSignup.data.userId;

        const userSignin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken = response.data.token;
    })

    test("User is not able to hit admin Endpoints", async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnail: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            name: "100 person interview room",
            defaultElements: [],
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
      
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy"
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const updateElementRequest = await axios.post(`${BACKEND_URL}/api/v1/admin/element/123`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(elementResponse.statusCode).toBe(403);
        expect(mapResponse.statusCode).toBe(403);
        expect(avatarResponse.statusCode).toBe(403);
        expect(updateElementRequest.statusCode).toBe(403);
    })

    test("User is able to hit admin Endpoints", async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnail: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            name: "100 person interview room",
            defaultElements: [],
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })
      
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            name: "Timmy"
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const updateElementRequest = await axios.post(`${BACKEND_URL}/api/v1/admin/element/123`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        expect(elementResponse.statusCode).toBe(200);
        expect(mapResponse.statusCode).toBe(200);
        expect(avatarResponse.statusCode).toBe(200);
        expect(updateElementRequest.statusCode).toBe(200);
    })

    test("Admin is able to update the imageUrl for an element", async () => {
        const elementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const elementId = elementResponse.data.id;

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementId}`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        expect(updateElementResponse.statusCode).toBe(200);
    })
})

describe("Websockets test", () => {
    let adminId;
    let adminToken;
    let userId;
    let userToken;
    let mapId;
    let elementId1;
    let elementId2;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages = [];
    let ws2Messages = [];

    function waitForAndPopLatestMessage(messageArray) {
        return new Promise(r => {
            if(messageArray.length > 0) {
                resolve(messageArray.shift());
            } else {
                let interval = setInterval(() => {
                    if(messageArray.length > 0) {
                        resolve(messageArray.shift());
                        clearInterval(interval);
                    }
                }, 100)
            }
        })
    }

    function HTTPSetup() {
        const username = `amnkarn-${Math.random()}`;
        const password = "1234";

        //admin signup & signin
        const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            role: "admin"
        })

        const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        })

        adminId = adminSignupResponse.data.id;
        adminToken = adminSigninResponse.data.token;

        //user signup & signin
        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + '-user',
            password,
            role: "user"
        })

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + '-user',
            password,
        })

        userId = userSignupResponse.data.id;
        userToken = userSigninResponse.data.token;

        //creat element & map
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            width: 1,
            height: 1,
            static: true
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        elementId1 = element1Response.data.id;
        elementId2 = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            thumbnail: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            name: "100 person interview room",
            defaultElements: [{
                    elementId: elementId1,
                    x: 20,
                    y: 20
                }, {
                    elementId: elementId1,
                    x: 18,
                    y: 20
                }, {
                    elementId: elementId2,
                    x: 19,
                    y: 20
                }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        mapId = mapResponse.id;

        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
            mapId: mapId
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        spaceId = space.spaceId;
    }

    async function WSSetup() {
        ws1 = await new WebSocket(WS_URL);
        ws2 = await new WebSocket(WS_URL);

        await new Promise ((r) => {
            ws1.onopen = r
        })

        await new Promise ((r) => {
            ws2.onopen = r
        })

        ws1.onmessage = (event) => {
            ws1Messages.push(JSON.parse(event.data));
        }
        
        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data));
        }

        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))

        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))
    }

    beforeAll( async () => {
        HTTPSetup();
        WSSetup();
    })

    test("Gey back for joining the space", () => {
        
    })
})