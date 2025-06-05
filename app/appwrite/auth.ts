import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, database } from "./client";
import { redirect } from "react-router";

export const loginWithGoogle = async () => {
    try {
        account.createOAuth2Session(
            OAuthProvider.Google,
        )

    } catch (error) {
        console.log("loginWithGoogle: ", error);
    }

}
export const getUser = async () => {
    try {
        const user = await account.get();

        if (!user) return redirect('/sign-in');

        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id),
                Query.select(['name', 'email', 'imageUrl', 'joinedAt', 'accountId'])
            ]
        );

    } catch (error) {
        console.log(error);
    }

}
export const logoutUser = async () => {
    try {
        await account.deleteSession('current');
        return true;

    } catch (error) {
        console.log(error);
    }

}
export const getGooglePicture = async () => {
    try {

        // Get the current session to retrieve the OAuth access token
        const session = await account.getSession("current");

        //Get the OAuth2 token from the session
        const oAuthToken = session.providerAccessToken;

        if (!oAuthToken) {
            console.log("No OAuth token found in session.");
            return null;
        }

        // Fetch profile info from Google People API
        const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            {
                headers: {
                    Authorization: `Bearer ${oAuthToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch profile photo from Google People API.");
        }

        const data = await response.json();


        // The photo URL is in data.photos[0].url
        return data.photos?.[0]?.url || null;

    } catch (error) {
        console.log("getGooglePicture: ", error);
    }

}
export const storeUserData = async () => {
    try {
        const user = await account.get();

        if (!user) return null;
        //Check if user already exists in the database
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id)
            ]
        )

        if (documents.length > 0) return documents[0];

        const imageUrl = await getGooglePicture();

        //Create a new user document in the database
        const newUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                name: user.name,
                email: user.email,
                imageUrl: imageUrl || '',
                joinedAt: new Date().toISOString(),
            }
        );
        return newUser;

    } catch (error) {
        console.log(error);
    }

}
export const getExistingUser = async () => {
    try {
        const user = await account.get();

        if (!user) return null;

        //Check if user already exists in the database
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", user.$id)]
        )

        if (documents.length === 0) return null;

        return documents[0];

    } catch (error) {
        console.log(error);
    }

}