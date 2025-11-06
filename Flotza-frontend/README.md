
# Project Structure & Development Guidelines

> **ℹ️ Note:**  
> The complete **style guide** is defined here → [./style-guide.md](./style-guide.md)  
> Please refer to it for theming conventions, UI component usage, and development patterns.


Welcome to the codebase! This document is a guide for new developers and interns to understand our folder structure, naming conventions, and architectural patterns like HOC and the Presentation/Container model.

---

## 1. Folder Structure Overview

```
src/
├── lib/
│   ├── assets/             # Static files: images, icons, fonts
│   ├── components/         # Shared or page-specific components
│   │   ├── [page-wise]/    # Components scoped to a specific route or page
│   │   ├── ui/             # Atomic UI components: Button, Input, etc.
│   │   └── widgets/        # Feature-based reusable blocks
│   ├── css/                # Global styles and theme configuration
│   ├── store/              # Redux store, slices, and middlewares
│   ├── utils/              # Helper and utility functions
│   └── api/               # API modules (RTK Query endpoints)

├── routes/
│   ├── admin/
│   │   ├── index.jsx       # Admin dashboard or landing
│   │   └── layout.jsx      # Admin-specific layout
│   ├── login/
│   │   └── index.jsx       # Login page
│   ├── user/
│   │   ├── index.jsx       # User dashboard or landing
│   │   └── layout.jsx      # User-specific layout
│   └── Routes.js           # Main route handler or React Router config
```

---

## 2. Architectural Patterns

### 2.1 Higher-Order Components (HOC)

Use HOCs for cross-cutting concerns like authentication, permissions, logging, and error handling.

**Location Suggestion:**  
`lib/components/HOC/`

**Example:**
```js
// lib/components/HOC/withAuth.js
const withAuth = (WrappedComponent) => (props) => {
  // Auth logic here
  return <WrappedComponent {...props} />;
};
export default withAuth;
```

**Usage:**
```js
import withAuth from 'lib/components/HOC/withAuth';
export default withAuth(UserDashboard);
```

---

### 2.2 Presentation / Container Pattern

This helps maintain clean separation between logic and UI.

- **Containers**: Manage state, API calls, and data transformation.
- **Presentations**: Pure components with no business logic—just render UI.

**Example File Structure:**
```
user/
├── UserContainer.jsx    # Handles logic and data fetching
└── UserView.jsx         # Stateless, visual component
```

**UserContainer.jsx**
```js
import UserView from './UserView';
import { useSelector } from 'react-redux';

const UserContainer = () => {
  const userData = useSelector(state => state.user.data);
  return <UserView data={userData} />;
};

export default UserContainer;
```

**UserView.jsx**
```js
const UserView = ({ data }) => (
  <div>{data.name}</div>
);

export default UserView;
```

---

## 3. Coding & Style Guidelines

- **PascalCase** for component files and folders.
- **camelCase** for variable and function names.
- Reuse shared components from `lib/components/ui` and `lib/components/widgets`.
- Place common logic in `lib/utils`.
- Group Redux logic by slice under `lib/store`.

---

## 4. Contribution Checklist

- [ ] Use functional components and hooks.
- [ ] Follow Presentation/Container separation.
- [ ] Use HOC when repeating behavior across pages.
- [ ] Keep logic outside UI components.
- [ ] Add helpful comments for any non-obvious logic.
- [ ] Create reusable UI elements in `ui/`.



<br><br><br>
<br><br><br>
<br><br><br>

# **Redux, RTK Query & Helper Function Guidelines**

This section explains how to correctly manage global state, API calls, and shared logic using Redux Toolkit, RTK Query, and helper utilities.

---

### **1. Redux Toolkit (RTK) Guidelines**

📁 **Directory:** `lib/store/`

#### ✅ **Slice Structure**

Each feature should have its own slice.

**Example: `lib/store/userSlice.js`**

```js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.data = action.payload;
    },
    clearUser(state) {
      state.data = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
```

#### 🧠 **Best Practices**

* Group reducers by domain (user, cart, auth, etc.)
* Avoid deeply nested state unless necessary.
* Keep slices small and composable.

---

### **2. RTK Query Guidelines**

📁 **Directory:** `lib/api/`

RTK Query helps you fetch, cache, and manage data seamlessly with Redux.

#### ✅ **API Setup**

**Example: `lib/api/userApi.js`**

```js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getUserById: builder.query({
      query: (id) => `users/${id}`,
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const { useGetUserByIdQuery, useUpdateUserMutation } = userApi;
```

#### 🧠 **Best Practices**

* Separate APIs by feature (e.g., `authApi.js`, `productApi.js`).
* Use `reducerPath` to avoid conflicts.
* Always use auto-generated hooks in components.
* Cache invalidation: Use `providesTags` and `invalidatesTags`.

---

### **3. Helper Functions**

📁 **Directory:** `lib/utils/`

Helper functions should contain **pure logic**, such as formatting, filtering, date manipulation, etc.

#### ✅ **Example: `lib/utils/dateFormatter.js`**

```js
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```

#### 🧠 **Best Practices**

* Write pure functions (no side effects).
* Keep each utility single-purpose.
* Name clearly and document if non-obvious.
* Group utilities by domain if growing large (`dateUtils.js`, `stringUtils.js`, etc.)

---

### ✅ Summary

| Feature       | Location     | Purpose                          |
| ------------- | ------------ | -------------------------------- |
| Redux Slice   | `lib/store/` | Local/global state management    |
| RTK Query API | `lib/api/`  | Server interaction + caching     |
| Helpers       | `lib/utils/` | Reusable pure functions (non-UI) |



<br><br><br>
<br><br><br>
<br><br><br>

# 🧩 RTK Query Usage for API Methods

📁 **Folder:** `lib/api/`

Below are examples of how to write `GET`, `POST`, `PUT`, and `DELETE` endpoints using `createApi` from Redux Toolkit Query.

---

### 🔍 GET Request – Fetch Single or Multiple Items

```js
// lib/api/userApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getUserById: builder.query({
      query: (id) => `users/${id}`,
    }),
    getAllUsers: builder.query({
      query: () => `users`,
    }),
  }),
});

export const { useGetUserByIdQuery, useGetAllUsersQuery } = userApi;
```

---

### 📝 POST Request – Create Item

```js
// In the same userApi file
addUser: builder.mutation({
  query: (user) => ({
    url: `users`,
    method: 'POST',
    body: user,
  }),
}),
```

```js
// Usage in component
const [addUser, { isLoading }] = useAddUserMutation();
await addUser({ name: "Alice", email: "alice@example.com" });
```

---

### 🛠️ PUT Request – Update Item

```js
updateUser: builder.mutation({
  query: ({ id, ...data }) => ({
    url: `users/${id}`,
    method: 'PUT',
    body: data,
  }),
}),
```

```js
// Usage
const [updateUser] = useUpdateUserMutation();
await updateUser({ id: 1, name: "Updated Alice" });
```

---

### ❌ DELETE Request – Delete Item

```js
deleteUser: builder.mutation({
  query: (id) => ({
    url: `users/${id}`,
    method: 'DELETE',
  }),
}),
```

```js
// Usage
const [deleteUser] = useDeleteUserMutation();
await deleteUser(1);
```

---

## ✅ Best Practices for RTK Query

| Action   | Hook Name Example       | Recommendation                         |
| -------- | ----------------------- | -------------------------------------- |
| `GET`    | `useGetUsersQuery`      | Use `query` and handle loading/errors  |
| `POST`   | `useAddUserMutation`    | Use `mutation`, validate before submit |
| `PUT`    | `useUpdateUserMutation` | Include `id` in body or path           |
| `DELETE` | `useDeleteUserMutation` | Confirm deletion before calling        |

---

### 🧼 Cache Invalidation Tip

To automatically refresh data after `POST/PUT/DELETE`, use:

```js
addUser: builder.mutation({
  query: (user) => ({ url: 'users', method: 'POST', body: user }),
  invalidatesTags: ['Users'],
}),
getAllUsers: builder.query({
  query: () => 'users',
  providesTags: ['Users'],
}),
```

> This will ensure that after a new user is added, `getAllUsers` is refetched.

---

