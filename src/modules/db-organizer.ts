import { store } from "./store";
import { firebaseApp } from "./firebase";
import 'firebase/firestore';
import { images as storage } from "./firebase-storage";

// ---------------- Enums

import { tool, toolEnum } from "../enums/tools";
import { role, roleEnum } from "../enums/roles";
import { type, typeEnum } from "../enums/types";
import { client, clientEnum } from "../enums/clients";
import { categoryEnum } from "../enums/categories";

// ---------------- Selection

store.commit("addColumn",
  {
    mode: "Percent",
    size: "100%",
    subtraction: "100",
    color: "silver",
    expression: "sz1b4m100",
    block: "column",
  }
);

store.commit("addColumn",
  {
    mode: "Fixed",
    size: "100",
    subtraction: "0",
    color: "cod-grey",
    expression: "sz100",
    block: "column",
  },
);

// ---------------- Firebase
const db = firebaseApp.firestore();

function getID(client: string, date: string): string {
  client = client.replace(/\s/g, "").toLowerCase();
  date = date.replace(/\//g, "");
  return `${client}_${date}`;
}

db.collection("users")
  .doc("main")
  .get()
  .then((doc) => {
    store.commit("setValue", { name: "user", value: doc.data() });
  });

db.collection('projects')
  .get()
  .then(querySnapshot => {
    const projectsDB = querySnapshot.docs.map(doc => {
      const p = doc.data();

      const links = p["links"].map(
        link => {
          const params = link["params"].length ? `?${link["params"].join("&")}` : '';
          const url = link["url"];

          return {
            "url": `${url}${params}`,
            "text": link["text"],
          }
        }
      );

      const roles = p["roles"].map(
        item => role[roleEnum[item]]
      );

      const tools = p["tools"].map(
        item => tool[toolEnum[item]]
      );

      const project = {
        "title": p["title"],
        "category": categoryEnum[p["category"]],
        "client": client[clientEnum[p["client"]]],
        "date": p["date"],
        "type": type[typeEnum[p["type"]]],
        "disabled": p["disabled"],
        "links": links,
        "roles": roles,
        "tools": tools,
      };

      const key = getID(project.client, project.date);
      const src = `preview-wide/${key}.jpg`;

      // storage
      //   .ref(src)
      //   .getDownloadURL()
      //   .then(url => {
      //     project["image"] = url;
      //   })
      //   .catch((e) => project["image"] = "");

      return project;
    });
    store.commit("setValue", { name: "projects", value: projectsDB });
  });