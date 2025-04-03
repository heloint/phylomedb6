describe("Footer Links", () => {
    const ROOT_URL = "http://localhost:3050";
    beforeEach(() => {
        cy.visit(ROOT_URL);
    });

    const quickLinks = [
        { name: "Phylomes", href: ROOT_URL + "/phylomes" },
        { name: "Search", href: ROOT_URL + "/search/gene" },
        { name: "Phylo Explorer", href: ROOT_URL + "/phylo-explorer" },
        { name: "Erga", href: ROOT_URL + "/erga" },
        { name: "Help", href: ROOT_URL + "/help" },
        { name: "Login", href: ROOT_URL + "/login" },
    ];

    const otherLinks = [
        { name: "About", href: ROOT_URL + "/about" },
        { name: `What's new?`, href: ROOT_URL + "/" },
        { name: "Linking PhylomedDB", href: ROOT_URL + "/about" },
        { name: "FAQ", href: ROOT_URL + "/faq" },
        { name: "Cookies", href: ROOT_URL + "/cookie-policy" },
        { name: "Privacy", href: ROOT_URL + "/privacy-policy" },
    ];

    quickLinks.forEach((link) => {
        it(`should navigate to ${link.name}`, () => {
            cy.contains("QUICK LINKS")
                .parent()
                .contains(link.name)
                .click({ force: true });
            cy.url().should("include", link.href);
        });
    });

    otherLinks.forEach((link) => {
        it(`should navigate to ${link.name}`, () => {
            cy.contains("OTHERS")
                .parent()
                .contains(link.name)
                .click({ force: true });
            cy.url().should("include", link.href);
        });
    });

    const organizationLinks = [
        { alt: "irb logo", href: "https://www.irbbarcelona.org" },
        { alt: "bsc logo", href: "https://www.bsc.es/" },
        { alt: "inb logo", href: "https://inb-elixir.es/" },
        { alt: "elixir logo", href: "https://elixir-europe.org/" },
    ];

    organizationLinks.forEach((link) => {
        it(`should have a working ${link.alt} link`, () => {
            cy.get(`img[alt='${link.alt}']`)
                .parent()
                .should("have.attr", "href", link.href);
        });
    });

    it("should have a working GitHub link", () => {
        cy.get("img[alt='github logo']")
            .parent()
            .should("have.attr", "href", "https://github.com/Gabaldonlab/");
    });

    it("should have a working X (Twitter) link", () => {
        cy.get("img[alt='x logo']")
            .parent()
            .should("have.attr", "href", "https://x.com/phylomedb");
    });

    it("should have a working Creative Commons link", () => {
        cy.get("img[alt='creative commons logo']")
            .parent()
            .should(
                "have.attr",
                "href",
                "https://creativecommons.org/licenses/by-nc/2.0/legalcode",
            );
    });

    it("should display the copyright text", () => {
        cy.contains("© COPYRIGHT 2024").should("be.visible");
    });
});
