const ERGA_URL = "http://localhost:3050/erga";

describe("Erga page", () => {
    it("Genome Biology Article link is working", () => {
        cy.visit(ERGA_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();

        cy.origin("https://genomebiology.biomedcentral.com", () => {
            Cypress.on("uncaught:exception", (err) => {
                console.log("Uncaught exception:", err);
                return false;
            });
        });
        cy.get('[data-cy="genome-biology-article-link"]').click();
        cy.origin("https://genomebiology.biomedcentral.com", () => {
            cy.wait(2000);
            cy.on("uncaught:exception", (err) => {
                return false;
            });
            cy.url().should(
                "contain",
                "https://genomebiology.biomedcentral.com/articles/10.1186/s13059-016-1090-1",
            );
        });
    });

    it("PLOS Biology Article link is working", () => {
        cy.visit(ERGA_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.origin("https://journals.plos.org", () => {
            Cypress.on("uncaught:exception", (err) => {
                console.log("Uncaught exception:", err);
                return false;
            });
        });
        cy.get('[data-cy="plos-biology-link"]').click();
        cy.origin("https://journals.plos.org", () => {
            cy.url().should(
                "contain",
                "https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1000313",
            );
        });
    });

    it("Biorxiv Article link is working", () => {
        cy.visit(ERGA_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="biorxiv-article"]').click();
        cy.origin("https://www.biorxiv.org/", () => {
            cy.url().should(
                "contain",
                "https://www.biorxiv.org/content/10.1101/2024.03.21.586163v1",
            );
        });
    });

    it("Nature Article link is working", () => {
        cy.visit(ERGA_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="nature-link"]').click();
        cy.origin("https://www.nature.com", () => {
            cy.url().should(
                "contain",
                "https://www.nature.com/articles/s41586-023-05868-1",
            );
        });
    });

    it("Google form link is working", () => {
        cy.visit(ERGA_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="google-form-link"]').click();
        cy.origin("https://docs.google.com", () => {
            cy.url().should(
                "contain",
                "https://docs.google.com/forms/d/e/1FAIpQLSdQtmJUkGpW7x1SE1zUwni67hDdwpLLK2f95y5popGF_vGsog/viewform",
            );
        });
    });
});
