import path from "path";

const GENE_URL = "http://localhost:3050/search/gene";
const GENE_VALUE = "fam169b";
const GENE_URL_WITH_PARAMS = `http://localhost:3050/search/gene?gene=${GENE_VALUE}`;
describe("Genes Page", () => {
    it("Pressing the search button if the input is empty should not redirect to any site.", () => {
        cy.visit(GENE_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="confirm-search-button"]').click();
        cy.url().should("not.include", "/gene?");
    });

    it("Search gene show genes if a valid gene is introduced", () => {
        cy.visit(GENE_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="search-gene-input"]').type("TP63");
        cy.get('[data-cy="confirm-search-button"]').click();
        cy.get('[data-cy="header-genes-table"]');
    });

    it("Search gene don't show genes if a not valid gene is introduced", () => {
        cy.visit(GENE_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="search-gene-input"]').type("testestest");
        cy.get('[data-cy="confirm-search-button"]').click();
        cy.get('[data-cy="header-genes-table"]').should("not.exist");
    });
});

//GENES PAGE WITH PARAMS

describe("Genes Page with params", () => {
    it("Verify the download CSV button", () => {
        cy.visit(GENE_URL_WITH_PARAMS);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="download-button"]')
            .eq(0)
            .invoke("removeAttr", "target")
            .click({ force: true });
        cy.wait(4000);
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.task("exists", path.join(downloadsFolder, `genes.csv`)).then(() => {
            cy.log("File downloaded successfully ");
        });
    });

    it("Verify the download PDF button", () => {
        cy.visit(GENE_URL_WITH_PARAMS);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="download-button"]')
            .eq(1)
            .invoke("removeAttr", "target")
            .click({ force: true });
        cy.wait(4000);
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.task("exists", path.join(downloadsFolder, `file.pdf`)).then(() => {
            cy.log("File downloaded successfully ");
        });
    });

    it("GeneId button redirects to genes page", () => {
        cy.visit(GENE_URL_WITH_PARAMS);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="geneId-button"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="geneId-button"]')
                    .eq(0)
                    .invoke("removeAttr", "target")
                    .click();
                cy.url().should("include", `/genes/${value}`);
            });
    });
});
