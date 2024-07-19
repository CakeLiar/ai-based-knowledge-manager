'use client';

import Image from "next/image";
import { handleSend, getPages} from "./buttonfunctions";
import {signOut, useSession} from "next-auth/react";
import {useState, useEffect} from "react";

type PageBlockProps = {
  link: string;
  imageUrl: string;
  snippet: string;
  className?: string;
};

const PageBlock: React.FC<PageBlockProps> = ({ link, imageUrl, snippet, className }) => {
  return (
    <div className={`card ${className}`} style={{ padding: "10px", background: "white", width: "400px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      <Image src={imageUrl} alt="Image" width={100} height={75} />
      <div style={{ padding: "10px", background: "white", width: "400px", display: "flex", flexDirection: "column", alignItems: "initial", justifyContent: "center" }}>
        <p style={{ color: "black" }}>{snippet}</p>
        <button onClick={()=>{window.open(link)?.focus()}}>open</button>
      </div>
      
    </div>
  );
};

export default function Home() {
  const session = useSession();
  const [pages, setPages] = useState<{business: any[], articles_to_read: any[], self_development: any[]}>({business: [], articles_to_read: [], self_development: []});
  
  const [pageSnippets, setPageSnippets] = useState<{[key: string]: string}>({});
  
  const [pageImages, setPageImages] = useState<{[key: string]: string}>({});

  const { status } = useSession({ required: true, onUnauthenticated: () => signOut() });

  useEffect(() => {
    async function fetchPages() {
      const result = await getPages(session?.data?.user?.email!);
      setPages(result[0]);
      setPageSnippets(result[1]);
      setPageImages(result[2]);
    }

    if (session?.status === "authenticated") {
      fetchPages().then(() => {
        console.log("done getting pages");
        console.log(pages);
      });
    }
  }, [session]);

  return (
    <main className="flex items-center justify-center h-screen">
      <div>
        hiii {session?.data?.user?.name}
        <br/>
        <br/>

        <div style={{display: "flex", flexDirection:'row', width: 400}}>
          <input type="text" placeholder="paste link" id="textInput" className="textInput" />
          <button onClick={()=>handleSend(session?.data?.user?.email!)}>add to memory</button>
        </div>

        <br/>
        <details>
          <summary>cool business</summary>
          {pages.business.map((page, index) => {
            return (
              <PageBlock
                key={index}
                link={page}
                imageUrl={pageImages[page]}
                snippet={pageSnippets[page]}
                className="custom-class"
              />
            );
          })}
        </details>
        
        
        <details>
          <summary>self development</summary>
          {pages.self_development.map((page, index) => {
            return (
              <PageBlock
                key={index}
                link={page}
                imageUrl={pageImages[page]}
                snippet={pageSnippets[page]}
                className="custom-class"
              />
            );
          })}
        </details>

        <details>
          <summary>cool articles to read</summary>
          {pages.articles_to_read.map((page, index) => {
            return (
              <PageBlock
                key={index}
                link={page}
                imageUrl={pageImages[page]}
                snippet={pageSnippets[page]}
                className="custom-class"
              />
            );
          })}
        </details>
        <br/>
        <br/>
        <button onClick={() => signOut()} style={{ fontSize: "15px" }}>Logout</button>
      </div>
    </main>
  );
}