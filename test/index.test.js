const axios2 = require("axios");


const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001";

const axios = axios2.create({ //to accept all status code
    validateStatus: () => true,
})

describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "aman" + Math.random();
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(response.status).toBe(201);

        const updatedRequest = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(updatedRequest.status).toBe(400)
    })

    test('Signup request fails if username is empty', async () => {
        const username = "aman" + Math.random();
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password,
            type: "admin" // or user
        })

        expect(response.status).toBe(400);
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

        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
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

        expect(response.status).toBe(403);
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
 
        expect(response.status).toBe(400)
    })

    test("User can update their information with right avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: avatarId,
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })

    test("User is not able to update their metadata if auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId,
        })

        expect(response.status).toBe(403);
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
    }, 10000)

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists the recently created avatars", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);

        const currentAvatar = response.data.avatars.filter(x => x.id == avatarId );
        //console.log(response.data.avatars);
        //console.log(currentAvatar);

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

        //console.log("admin signup response", signupResponse.data);
        //console.log("admin signin response", response.data);

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

        userToken = userSignin.data.token;

        //console.log("user signup response", userSignup.data);
        //console.log("user signin response", userSignin.data);

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

        //console.log("element1 response", element1.data);
        //console.log("element2 response", element2.data);

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

        //console.log("map response", mapResponse.data);
    }, 10000)

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
        //console.log(space.status);
        //console.log(space.data);
        expect(space.status).toBe(200);
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

        expect(space.status).toBe(200);
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

        expect(response.status).toBe(400);
    })

    test("User is not able to delete a space that does not exists", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExists`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(400);
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
        //console.log(`Bearer ${userToken}`);

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${space.data.spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        expect(deleteResponse.status).toBe(200);
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

        expect(deleteResponse.status).toBe(403); //different status code
    })

    test("Admin have no space initially", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
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
        
        const filterSpace = response.data.spaces.filter(x => {
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
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })
        adminId = signupResponse.data.userId;
        adminToken = response.data.token;

        //user signup and signin
        const userSignup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })

        const userSignin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })
        
        userId = userSignup.data.userId;
        userToken = userSignin.data.token;


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

        //console.log("element1 response", element1Response.data);
        //console.log("element2 response", element2Response.data);

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
        ]}, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })

        mapId = mapResponse.data.id;
        //console.log("map response", mapResponse.data);

        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
            mapId: mapId
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        spaceId = space.data.spaceId;
        //console.log("space response", space.data);
    }, 25000)

    test("Incorrect spaceId returns a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/fds546546`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        });
        expect(response.status).toBe(400);
    })

    test("Correct space id returns all the elements", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        });
        //console.log(response.data);

        expect(response.data.dimension).toBe("100x200");
        expect(response.data.elements.length).toBe(3);
    })

    test("Adding an element works as expected", async () => {
        const addElem = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            elementId: elementId1,
            spaceId: String(spaceId),
            x: 50,
            y: 20
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        //console.log("res is: ", addElem);

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        //console.log(newResponse.data.elements);

        expect(addElem.status).toBe(200)
        expect(newResponse.data.elements.length).toBe(4);
    })

    test("Delete endpoint is able to delete an element", async () => {
        const space = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        });
        //console.log(space.data);

        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            data: {
                id: space.data.elements[0].id
            },
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        });

        const updatedSpace = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        });

        expect(updatedSpace.data.elements.length).toBe(3);
    })

    test("Adding an element fails if the elements lies outside the dimensions", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": elementId1,
            "spaceId": spaceId,
            "x": 500500,
            "y": 210000
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        //console.log(response.data);
        expect(response.status).toBe(400)
    })
})

//describe("Admin endpoints", () => {
//    let adminToken = "";
//    let adminId = "";
//    let userToken;
//    let userId;

//    beforeAll(async () => {
//        const username = `amnkarn-${Math.random()}`;
//        const password = "123456";

//        //admin signup & signin
//        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//            username,
//            password,
//            type: "admin"
//        })

//        adminId = signupResponse.data.userId;

//        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//            username,
//            password
//        })

//        adminToken = response.data.token;

//        //user signup and signin
//        const userSignup = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//            username: username + "-user",
//            password,
//            type: "user"
//        })

//        userId = userSignup.data.userId;

//        const userSignin = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//            username: username + "-user",
//            password
//        })

//        userToken = response.data.token;
//    })

//    test("User is not able to hit admin Endpoints", async () => {
//        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//            width: 1,
//            height: 1,
//            static: true
//        }, {
//            headers: {
//                "Authorization": `Bearer ${userToken}`
//            }
//        })

//        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
//            thumbnail: "https://thumbnail.com/a.png",
//            dimensions: "100x200",
//            name: "100 person interview room",
//            defaultElements: [],
//        }, {
//            headers: {
//                "Authorization": `Bearer ${userToken}`
//            }
//        })
      
//        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//            name: "Timmy"
//        }, {
//            headers: {
//                "Authorization": `Bearer ${userToken}`
//            }
//        })

//        const updateElementRequest = await axios.post(`${BACKEND_URL}/api/v1/admin/element/123`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//        }, {
//            headers: {
//                "Authorization": `Bearer ${userToken}`
//            }
//        })

//        expect(elementResponse.statusCode).toBe(403);
//        expect(mapResponse.statusCode).toBe(403);
//        expect(avatarResponse.statusCode).toBe(403);
//        expect(updateElementRequest.statusCode).toBe(403);
//    })

//    test("User is able to hit admin Endpoints", async () => {
//        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//            width: 1,
//            height: 1,
//            static: true
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })

//        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
//            thumbnail: "https://thumbnail.com/a.png",
//            dimensions: "100x200",
//            name: "100 person interview room",
//            defaultElements: [],
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })
      
//        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//            name: "Timmy"
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })

//        const updateElementRequest = await axios.post(`${BACKEND_URL}/api/v1/admin/element/123`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })

//        expect(elementResponse.statusCode).toBe(200);
//        expect(mapResponse.statusCode).toBe(200);
//        expect(avatarResponse.statusCode).toBe(200);
//        expect(updateElementRequest.statusCode).toBe(200);
//    })

//    test("Admin is able to update the imageUrl for an element", async () => {
//        const elementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//            width: 1,
//            height: 1,
//            static: true
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })

//        const elementId = elementResponse.data.id;

//        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementId}`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })

//        expect(updateElementResponse.statusCode).toBe(200);
//    })
//})

//describe("Websockets test", () => {
//    let adminId;
//    let adminToken;
//    let userId;
//    let userToken;
//    let mapId;
//    let elementId1;
//    let elementId2;
//    let spaceId;
//    let ws1;
//    let ws2;
//    let ws1Messages = [];
//    let ws2Messages = [];
//    let userX;
//    let userY;
//    let adminX;
//    let adminY;

//    function waitForAndPopLatestMessage(messageArray) {
//        return new Promise(r => {
//            if(messageArray.length > 0) {
//                resolve(messageArray.shift());
//            } else {
//                let interval = setInterval(() => {
//                    if(messageArray.length > 0) {
//                        resolve(messageArray.shift());
//                        clearInterval(interval);
//                    }
//                }, 100)
//            }
//        })
//    }

//    async function HTTPSetup() {
//        const username = `amnkarn-${Math.random()}`;
//        const password = "1234";

//        //admin signup & signin
//        const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//            username,
//            password,
//            role: "admin"
//        })

//        const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//            username,
//            password,
//        })

//        adminId = adminSignupResponse.data.id;
//        adminToken = adminSigninResponse.data.token;

//        //user signup & signin
//        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//            username: username + '-user',
//            password,
//            role: "user"
//        })

//        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//            username: username + '-user',
//            password,
//        })

//        userId = userSignupResponse.data.id;
//        userToken = userSigninResponse.data.token;

//        //creat element & map
//        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//            width: 1,
//            height: 1,
//            static: true
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })

//        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//            imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
//            width: 1,
//            height: 1,
//            static: true
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })

//        elementId1 = element1Response.data.id;
//        elementId2 = element2Response.data.id;

//        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
//            thumbnail: "https://thumbnail.com/a.png",
//            dimensions: "100x200",
//            name: "100 person interview room",
//            defaultElements: [{
//                    elementId: elementId1,
//                    x: 20,
//                    y: 20
//                }, {
//                    elementId: elementId1,
//                    x: 18,
//                    y: 20
//                }, {
//                    elementId: elementId2,
//                    x: 19,
//                    y: 20
//                }
//            ]
//        }, {
//            headers: {
//                "Authorization": `Bearer ${adminToken}`
//            }
//        })

//        mapId = mapResponse.id;

//        const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
//            name: "Test",
//            dimensions: "100x200",
//            mapId: mapId
//        }, {
//            headers: {
//                "Authorization": `Bearer ${userToken}`
//            }
//        })

//        spaceId = space.spaceId;
//    }

//    async function WSSetup() {
//        ws1 = await new WebSocket(WS_URL);
        
//        await new Promise ((r) => {
//            ws1.onopen = r
//        })
        
//        ws1.onmessage = (event) => {
//            ws1Messages.push(JSON.parse(event.data));
//        }
        
        
//        ws2 = await new WebSocket(WS_URL);

//        await new Promise ((r) => {
//            ws2.onopen = r
//        })

        
//        ws2.onmessage = (event) => {
//            ws2Messages.push(JSON.parse(event.data));
//        }

//        ws1.send(JSON.stringify({
//            "type": "join",
//            "payload": {
//                "spaceId": spaceId,
//                "token": adminToken
//            }
//        }))

//        ws2.send(JSON.stringify({
//            "type": "join",
//            "payload": {
//                "spaceId": spaceId,
//                "token": userToken
//            }
//        }))
//    }

//    beforeAll( async () => {
//        HTTPSetup();
//        WSSetup();
//    })

//    test("Get back for joining the space", () => {
//        ws1.send(JSON.stringify({
//            "type": "join",
//            "payload": {
//                "spaceId": spaceId,
//                "token": adminToken
//            }
//        }))

//        ws2.send(JSON.stringify({
//            "type": "join",
//            "payload": {
//                "spaceId": spaceId,
//                "token": userToken
//            }
//        }))

//        const message1 = await waitForAndPopLatestMessage(ws1Messages);
//        const message2 = await waitForAndPopLatestMessage(ws2Messages);

//        //message3 will come after joining "ws2" with "user-joined" and with paylaod
//        const message3 = await waitForAndPopLatestMessage(ws1Messages);
    
//        expect(message1.type).toBe("space-joined");
//        expect(message2.type).toBe("space-joined");

//        expect(message1.payload.users.length).toBe(0);
//        expect(message2.payload.users.length).toBe(1);
        
//        expect(message3.type).toBe("user-joined");
//        expect(message3.payload.x).toBe(message2.payload.spawn.x);
//        expect(message3.payload.y).toBe(message2.payload.spawn.y);
//        expect(message3.payload.userId).toBe(userId);

//        adminX = message1.payload.spawn.x;
//        adminY = message1.payload.spawn.y;
    
//        userX = message2.payload.spawn.x;
//        userY = message2.payload.spawn.y;
//    })

//    test("User should not be able to move across the boundry of the wall", () => {
//        ws1.send(JSON.stringify({
//            "type": "move",
//            "payload": {
//                "x": "1000000",
//                "y": "20000"
//            }
//        }))

//        const message = await waitForAndPopLatestMessage(ws1Messages);
    
//        expect(message.type).toBe("movement-rejected");
//        expect(message.payload.x).toBe(adminX);
//        expect(message.payload.y).toBe(adminY);
//    })

//    test("User should not be able to move two blocks at the same time", () => {
//        ws1.send(JSON.stringify({
//            "type": "move",
//            "payload": {
//                "x": adminX + 2,
//                "y": adminY
//            }
//        }))

//        const message = await waitForAndPopLatestMessage(ws1Messages);
    
//        expect(message.type).toBe("movement-rejected");
//        expect(message.payload.x).toBe(adminX);
//        expect(message.payload.y).toBe(adminY);
//    })

//    test("Correct movement should be broadcasted to the other sockets in the room", () => {
//        ws1.send(JSON.stringify({
//            "type": "move",
//            "payload": {
//                "x": adminX + 1,
//                "y": adminY,
//                "userId": adminId
//            }
//        }))

//        const message = await waitForAndPopLatestMessage(ws2Messages);
    
//        expect(message.type).toBe("movement");
//        expect(message.payload.x).toBe(adminX + 1);
//        expect(message.payload.y).toBe(adminY);
//    })

//    test("If a user leaves, other user receives a leave event", () => {
//        ws1.close();

//        const message = await waitForAndPopLatestMessage(ws2Messages);
//        expect(message.type).toBe("user-left");
//        expect(message.payload.userId).toBe(adminId)
//    })
//})