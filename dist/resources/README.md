# Static Resources

You can place your static images and other assets in this folder. 

Since this folder is inside the `public` directory, any file you put here will be served at the root path of the application. 

For example, if you add an image called `logo.png` to this folder, you can reference it in your React components like this:
```jsx
<img src="/resources/logo.png" alt="Logo" />
```
