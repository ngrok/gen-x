import React from "react";

export interface ButtonProps {
	onClick?: () => void;
	children: React.ReactNode;
	variant?: "primary" | "secondary";
}

export function Button({ onClick, children, variant = "primary" }: ButtonProps) {
	return (
		<button onClick={onClick} className={`btn btn-${variant}`}>
			{children}
		</button>
	);
}
