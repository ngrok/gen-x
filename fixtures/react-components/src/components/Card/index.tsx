import React from "react";

export interface CardProps {
	title: string;
	children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
	return (
		<div className="card">
			<h3>{title}</h3>
			<div className="card-body">{children}</div>
		</div>
	);
}
