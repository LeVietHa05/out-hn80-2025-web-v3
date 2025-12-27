export interface Menu {
    menuId: string;
    name: string;
    items: MenuItem[]
};

export interface MenuItem {
    itemId: string;
    name: string;
    category: string;
}

export interface Vote {
    date: string,
    type: string,
    menus: MenuVote[],
    winner: null | string,
    totalRaw: object
}

export interface MenuVote {
    menuId: string,
    name: string,
    votedStudentIds: string[]
}