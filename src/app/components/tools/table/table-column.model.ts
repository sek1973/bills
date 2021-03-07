/** The data table columns should be defined using following structure */
export interface TableColumn {
	name: string /** Unique name of column */;
	header: string /** Text displayed in column header */;
	toolTip?: string;
	sort?: boolean;
	filter?: boolean;
	hidden?: boolean;
}
