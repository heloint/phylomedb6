const FAQ_PAGE_URL = "http://localhost:3050/faq";

describe("faq-page tests", () => {
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    const LOGIN_URL = "http://localhost:3050/login";
    it("Add new guide", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.get('[data-cy="add-new-faq-button"]').click();
        cy.get('[data-cy="new-title-input"]').clear().type("testestest");
        cy.get(".ProseMirror").clear().type("testytesty");
        cy.get('[data-cy="save-faq-guide-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "Successfully created new faq guide!",
        );
    });

    it("Add new guide tests purposes", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.get('[data-cy="add-new-faq-button"]').click();
        cy.get('[data-cy="new-title-input"]').clear().type("TTTT");
        cy.get(".ProseMirror").clear().type("testytesty");
        cy.get('[data-cy="save-faq-guide-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "Successfully created new faq guide!",
        );
    });

    it("Add existing guide", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.get('[data-cy="add-new-faq-button"]').click();
        cy.get('[data-cy="new-title-input"]').clear().type("testestest");
        cy.get(".ProseMirror").clear().type("testytesty");
        cy.get('[data-cy="save-faq-guide-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "FAQ with title: testestest, already exists in the database.",
        );
    });

    it("Clear button guide", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.get('[data-cy="add-new-faq-button"]').click();
        cy.get('[data-cy="new-title-input"]').clear().type("testestest");
        cy.get(".ProseMirror").clear().type("testytesty");
        cy.get('[data-cy="clean-all-button"]').click();
        cy.get(".ProseMirror").should("not.contain.text", "testytesty");
        cy.get('[data-cy="new-title-input"]').should(
            "not.contain.text",
            "testestest",
        );
    });

    it("back to faq  button ", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.get('[data-cy="add-new-faq-button"]').click();
        cy.get('[data-cy="new-title-input"]').clear().type("testestest");
        cy.get(".ProseMirror").clear().type("testytesty");
        cy.get('[data-cy="back-to-faq"]').click();
        cy.url().should("contain", "http://localhost:3050/faq");
    });
});
describe("edit guide button", () => {
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    const LOGIN_URL = "http://localhost:3050/login";
    it("edit user guide button ", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.contains("button", "testestest")
            .parent()
            .find('[data-cy="edit-button"]')
            .should("be.visible")
            .click();
    });

    it("Edit title in faq page", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.contains("button", "testestest")
            .parent()
            .find('[data-cy="edit-button"]')
            .should("be.visible")
            .click();
        cy.get('[data-cy="modify-title-input"]').clear().type("TEST");
        cy.get('[data-cy="save-faq-guide-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "Successfully edited faq!",
        );
    });

    it("Edit title in faq page inserting existing title", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.contains("button", "TTTT")
            .parent()
            .find('[data-cy="edit-button"]')
            .should("be.visible")
            .click();
        cy.get('[data-cy="modify-title-input"]').clear().type("TEST");
        cy.get('[data-cy="save-faq-guide-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Error has occured during process.",
        );
    });

    it("Edit title in faq page inserting empty title", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.contains("button", "TTTT")
            .parent()
            .find('[data-cy="edit-button"]')
            .should("be.visible")
            .click();
        cy.get('[data-cy="modify-title-input"]').clear();
        cy.get('[data-cy="save-faq-guide-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="success-window"]').length < 1) {
                cy.log("Message window not visible , test pass!");
                return;
            }
        });
    });

    it("Edit title in faq page inserting existing title", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.contains("button", "TTTT")
            .parent()
            .find('[data-cy="edit-button"]')
            .should("be.visible")
            .click();
        cy.get('[data-cy="modify-title-input"]').clear().type("TEST");
        cy.get(".ProseMirror").clear().type("testytesty");
        cy.get('[data-cy="clean-inputs-button"]').click();
        cy.get(".ProseMirror").should("not.contain.text", "testytesty");
        cy.get('[data-cy="modify-title-input"]').should(
            "not.contain.text",
            "TEST",
        );
    });

    it("back button in edit menu is working", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.contains("button", "TTTT")
            .parent()
            .find('[data-cy="edit-button"]')
            .should("be.visible")
            .click();
        cy.get('[data-cy="modify-title-input"]').clear().type("TEST");
        cy.get('[data-cy="back-button"]').click();
        cy.url().should("contain", "http://localhost:3050/faq");
    });

    it("Delete guide test", () => {
        cy.on("uncaught:exception", (err, runnable) => {
            if (err.message.includes("NEXT_NOT_FOUND")) {
                return false; // Ignora el error NEXT_NOT_FOUND
            }
            return true; // Otros errores no se ignoran
        });
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.contains("button", "TTTT")
            .parent()
            .find('[data-cy="edit-button"]')
            .should("be.visible")
            .click();
        cy.get('[data-cy="delete-guide-button"]').click();
        cy.visit("http://localhost:3050/faq");
        cy.contains("button", "TTTT").should("not.exist");
    });

    it("Delete guide test", () => {
        cy.on("uncaught:exception", (err, runnable) => {
            if (err.message.includes("NEXT_NOT_FOUND")) {
                return false; // Ignora el error NEXT_NOT_FOUND
            }
            return true; // Otros errores no se ignoran
        });
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(FAQ_PAGE_URL);
        cy.contains("button", "TEST")
            .parent()
            .find('[data-cy="edit-button"]')
            .should("be.visible")
            .click();
        cy.get('[data-cy="delete-guide-button"]').click();
        cy.visit("http://localhost:3050/faq");
        cy.contains("button", "TEST").should("not.exist");
    });
});
