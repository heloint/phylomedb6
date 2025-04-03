const ROOT_URL = "http://localhost:3050";

const login = () => {
    const LOGIN_URL = "http://localhost:3050/login";
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
    cy.wait(3000);
};

describe("Navbar Links", () => {
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    const LOGIN_URL = "http://localhost:3050/login";
    beforeEach(() => {
        login();
        cy.visit(ROOT_URL);
        cy.get('[data-cy="cookie-accept-button"]')
            .first()
            .click({ force: true });
    });

    const navbarLinks = [
        { name: "Phylomes", href: "/phylomes" },
        { name: "Search", href: "/search/gene" },
        { name: "Phylo Explorer", href: "/phylo-explorer" },
        { name: "Erga", href: "/erga" },
        { name: "About", href: "/about" },
        { name: "Help", href: "/help" },
        { name: "Admin page", href: "/admin" },
    ];

    navbarLinks.forEach((link) => {
        it(`should navigate to ${link.name}`, () => {
            cy.contains(link.name).click({ force: true });
            cy.url().should("include", link.href);
        });
    });
});
