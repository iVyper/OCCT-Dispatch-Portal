import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SnackbarProvider } from "./context/SnackbarProvider"; // Update the path to your SnackbarProvider component

import { ChakraProvider } from "@chakra-ui/react";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<ChakraProvider>
		<React.StrictMode>
			<SnackbarProvider>
				<App />
			</SnackbarProvider>
		</React.StrictMode>
	</ChakraProvider>
);
