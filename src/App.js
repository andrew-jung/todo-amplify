import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";

import { createTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";

import {
  AmplifyAuthenticator,
  AmplifySignUp,
  AmplifySignOut,
} from "@aws-amplify/ui-react";
import { Auth, Hub } from "aws-amplify";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: "", description: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);
  const [user, updateUser] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, [todos]);

  // useEffect(() => {
  //   Auth.currentAuthenticatedUser()
  //     .then((user) => updateUser(user))
  //     .catch(() => console.log("No signed in user."));
  //   Hub.listen("auth", (data) => {
  //     switch (data.payload.event) {
  //       case "signIn":
  //         return updateUser(data.payload.data);
  //       case "signOut":
  //         return updateUser(null);
  //     }
  //   });
  // }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log(`Unhandled exception fetching todos: `, err);
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setFormState(initialState);
      await API.graphql(graphqlOperation(createTodo, { input: todo }));
    } catch (err) {
      console.log(`Error creating todo: `, err);
    }
  }

  // TODO: https://docs.amplify.aws/ui/auth/authenticator/q/framework/react
  // TODO: Implement custom auth component, allow sign up; allow as guest
  // TODO: Set up auth user hooks, models
  return (
    // <div style={{ display: 'flex', justifyContent: 'center' }}>
    //   <AmplifyAuthenticator>
    //     <AmplifySignUp
    //       slot="sign-up"
    //       formFields={[
    //         { type: "username" },
    //         {
    //           type: "password",
    //           label: "Custom Password Label",
    //           placeholder: "custom password placeholder"
    //         },
    //         { type: "email" }
    //       ]}
    //     />
    //   </AmplifyAuthenticator>
    // </div>
    <div style={styles.container}>
      <h2>Todos</h2>
      <input
        onChange={(event) => setInput("name", event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) => setInput("description", event.target.value)}
        styles={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button styles={styles.button} onClick={addTodo}>
        Create Todo
      </button>

      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p styles={styles.todoName}>{todo.name}</p>
          <p styles={styles.todoDescription}>{todo.description}</p>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
};

export default App;
