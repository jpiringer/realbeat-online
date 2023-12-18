import React from 'react';

type CustomToggleProps = {
	children?: React.ReactNode;
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {};
};
// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
export const CustomToggle = React.forwardRef((props: CustomToggleProps, ref: React.Ref<HTMLButtonElement>) => (
	<button
		className="track-button"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			props.onClick(e);
		}}
	>
		{props.children}
	</button>
));
