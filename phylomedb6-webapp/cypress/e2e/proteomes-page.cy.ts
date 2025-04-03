import path from "path";
const PHYLOME = 4;
const PROTEOMES_URL = `http://localhost:3050/phylomes/${PHYLOME}/proteomes`;

describe("Proteomes Page", () => {
    it("Verify the download CSV button", () => {
        cy.visit(PROTEOMES_URL);
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
        cy.visit(PROTEOMES_URL);
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

    it("Verify the downloaded proteins of genome file button", () => {
        cy.visit(PROTEOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="genomeId-button"]')
            .first()
            .invoke("attr", "custom-value")
            .then((value) => {
                cy.get('[data-cy="genomeId-button"]')
                    .first()
                    .invoke("removeAttr", "target")
                    .click({ force: true });
                cy.wait(5000);
                const downloadsFolder = Cypress.config("downloadsFolder");
                cy.task(
                    "exists",
                    path.join(
                        downloadsFolder,
                        `Proteins_of_genome_${value}.fasta`,
                    ),
                ).then(() => {
                    cy.log("File downloaded successfully ");
                });
            });
    });
});
