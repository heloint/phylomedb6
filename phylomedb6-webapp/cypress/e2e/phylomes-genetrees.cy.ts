import path from "path";
const PHYLOME = 4;
const PHYLOME_GENETREES_URL = `http://localhost:3050/phylomes/${PHYLOME}/genetrees`;

describe("Genetrees page", () => {
    it("Verify the download CSV button", () => {
        cy.visit(PHYLOME_GENETREES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="download-button"]')
            .eq(0)
            .invoke("removeAttr", "target")
            .click({ force: true });
        cy.wait(4000);
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.task("exists", path.join(downloadsFolder, `phylomes.csv`)).then(
            () => {
                cy.log("File downloaded successfully ");
            },
        );
    });

    it("Verify the download PDF button", () => {
        cy.visit(PHYLOME_GENETREES_URL);
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

    it("The tree id button redirects to the phylo-view page.", () => {
        cy.visit(PHYLOME_GENETREES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="treeId-button"]')
            .eq(1)
            .invoke("removeAttr", "target")
            .click({ force: true });
        cy.url().should("include", "/phylo-view/tree");
    });

    it("The tree button redirects to the phylo-view page.", () => {
        cy.visit(PHYLOME_GENETREES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="tree-button"]')
            .eq(1)
            .invoke("removeAttr", "target")
            .click({ force: true });
        cy.url().should("include", "/phylo-view/tree");
    });

    it("The alignements button redirects to the alignement page.", () => {
        cy.visit(PHYLOME_GENETREES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="alignment-button"]')
            .eq(1)
            .invoke("removeAttr", "target")
            .click({ force: true });
        cy.url().should("include", "phylo-view/alignment");
    });
});
