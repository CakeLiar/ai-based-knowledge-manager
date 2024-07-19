import { initializeApp } from "firebase/app";
import {
    collection,
    getFirestore,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
} from 'firebase/firestore';

import { signIn, signOut, useSession } from "next-auth/react";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { useEffect } from "react";
import assert from "assert";
import { get } from "http";

const firebaseConfig = {
    apiKey: "AIzaSyCMmuWCaEudhn--lYhAzpogGW2ITG3lm8A",
    authDomain: "testingmemoapp.firebaseapp.com",
    projectId: "testingmemoapp",
    storageBucket: "testingmemoapp.appspot.com",
    messagingSenderId: "505951573899",
    appId: "1:505951573899:web:c344b7286e7fada86c418e",
    measurementId: "G-MVH19HE5L3"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


const colRef = collection(db, 'links');

export const handleSend = (email: string) => {
    // Add your logic here to handle the send event
    // For example, you can retrieve the input value and perform some action
    const input = document.querySelector('.textInput') as HTMLInputElement;
    const link = input.value;

    if (isWebsite(link)) {
        input.value = '';
        addPage(link, email);
    } else 
        alert("Invalid URL");
};

export const login = () => {
    signIn('google');
};

export const isWebsite = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

export const getLinkData = async (url: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8080/get-website-info?url=${url}`);
        var res: any[] = await response.json();
        return [res[1], res[0]];
    } catch (error) {   
        throw error;
    }
}

export const getPages = async (email: string):Promise<[{'articles_to_read': any[], 'business': any[], 'self_development': any[]}, {
    [key: string]: string;
}, {
    [key: string]: string;
}]> => { //  
    var pages: { articles_to_read: any[], business: any[], self_development: any[] } = {'articles_to_read': [], 'business': [], 'self_development': []};

    assert(email != null && email != '', "email is null");

    try {
        const docRef = doc(db, 'links', email);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            pages.articles_to_read = (docSnap.data().articles_to_read);
            pages.business = (docSnap.data().business);
            pages.self_development= (docSnap.data().self_development);
        } else {
            console.log("No such document!");
            await setDoc(docRef, {
                'articles_to_read': [],
                'business': [],
                'self_development': []
            });
        }
    
    } catch (e) {
        console.error("couldn't get uid: " + e);
    }

    var pageSnippets: { [key: string]: string } = {};
    var pageImages: { [key: string]: string } = {};
    for (var i = 0; i < pages.articles_to_read.length; i++) {
        try {
            const [snippet, imageUrl] = await getLinkData(pages.articles_to_read[i]);
            pageSnippets[pages.articles_to_read[i]] = snippet;
            pageImages[pages.articles_to_read[i]] = imageUrl;
        } catch (e) {
            console.error("couldn't get link data: " + e);
        }
    }
    for (var i = 0; i < pages.business.length; i++) {
        try {
            const [snippet, imageUrl] = await getLinkData(pages.business[i]);
            pageSnippets[pages.business[i]] = snippet;
            pageImages[pages.business[i]] = imageUrl;
        } catch (e) {
            console.error("couldn't get link data: " + e);
        }
    }
    for (var i = 0; i < pages.self_development.length; i++) {
        try {
            const [snippet, imageUrl] = await getLinkData(pages.self_development[i]);
            pageSnippets[pages.self_development[i]] = snippet;
            pageImages[pages.self_development[i]] = imageUrl;
        } catch (e) {
            console.error("couldn't get link data: " + e);
        }
    }
    return [pages, pageSnippets, pageImages];

}
export const addPage = async (link: string, email:string) => {
    
    //classifyLink(link);

    try {
        await getPages(email).then((data) => {
            const docRef = doc(db, 'links', email);
            var newPages = data[0];
            
            newPages.articles_to_read.push(link);

            updateDoc(docRef, newPages);
        }).catch((e) => {
            console.error("couldn't get pages: " + e);
            throw e;
        });
    } catch (e) {
        console.error("couldn't get uid: " + e);
    }
}