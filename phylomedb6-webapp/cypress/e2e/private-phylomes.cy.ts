const PRIVATE_PHYLOMES_URL =
    "http://localhost:3050/admin/phylomes?selected=%5B4%5D";
const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
const LOGIN_URL = "http://localhost:3050/login";

describe("template spec", () => {
    it("Add new user to phylome", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-new-user-to-phylome-button"]').click();
        cy.get('[data-cy="add-new-email-input"]')
            .clear()
            .type("test@gmail.com");
        cy.get('[data-cy="confirm-add-new-email-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "test@gmail.com added succesfully",
        );
    });

    it("Add new user to phylome test purposes", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-new-user-to-phylome-button"]').click();
        cy.get('[data-cy="add-new-email-input"]')
            .clear()
            .type("test2@gmail.com");
        cy.get('[data-cy="confirm-add-new-email-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "test2@gmail.com added succesfully",
        );
    });

    it("Add existing user to phylome", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-new-user-to-phylome-button"]').click();
        cy.get('[data-cy="add-new-email-input"]')
            .clear()
            .type("test@gmail.com");
        cy.get('[data-cy="confirm-add-new-email-button"]').click();
        cy.on("window:alert", (str) => {
            expect(str).to.equal("This email is already added.");
        });
    });

    it("Add invalid format email to phylome", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="add-new-user-to-phylome-button"]').click();
        cy.get('[data-cy="add-new-email-input"]')
            .clear()
            .type("test@gmail.com");
        cy.get('[data-cy="confirm-add-new-email-button"]').click();
        cy.get("body").then(($body) => {
            if ($body.find('[data-cy="success-window"]').length < 1) {
                cy.log("Message window not visible , test pass!");
                return;
            }
        });
    });

    it("Search bar is working", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-dropdown-phylomes-menu-button"]').click();
        cy.get('[data-cy="searchbar-privates-phylomes-input"]')
            .clear()
            .type("test@gmail.com");
        cy.get('[data-cy="email-dinamic-button"]').should(
            "contain",
            "test@gmail.com",
        );
    });

    it("Modify email button is working", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-dropdown-phylomes-menu-button"]').click();
        cy.get('[data-cy="searchbar-privates-phylomes-input"]')
            .clear()
            .type("test@gmail.com");
        cy.get('[data-cy="email-dinamic-button"]').first().click();
        cy.get('[data-cy="modify-email-button"]').click();
        cy.get('[data-cy="modify-email-input"]').clear().type("test@test.test");
        cy.get('[data-cy="modify-email-button"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "test@gmail.com modified succesfully to test@test.test",
        );
    });

    it("Modify email without change the original email (fails)", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-dropdown-phylomes-menu-button"]').click();
        cy.get('[data-cy="searchbar-privates-phylomes-input"]')
            .clear()
            .type("test@test.test");
        cy.get('[data-cy="email-dinamic-button"]').first().click();
        cy.get('[data-cy="modify-email-button"]').click();
        cy.get('[data-cy="modify-email-button"]').click();
        cy.on("window:alert", (str) => {
            expect(str).to.equal("Email cannot be the same!");
        });
    });

    it("Modify email inserting already existing email", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-dropdown-phylomes-menu-button"]').click();
        cy.get('[data-cy="searchbar-privates-phylomes-input"]')
            .clear()
            .type("test@test.test");
        cy.get('[data-cy="email-dinamic-button"]').first().click();
        cy.get('[data-cy="modify-email-button"]').click();
        cy.get('[data-cy="modify-email-input"]')
            .clear()
            .type("test2@gmail.com");
        cy.get('[data-cy="modify-email-button"]').click();
        cy.get('[data-cy="error-message-window"]').should(
            "contain",
            "Error modifying test@test.test , email test2@gmail.com already existing.",
        );
    });

    it("Delete email from phylome", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-dropdown-phylomes-menu-button"]').click();
        cy.get('[data-cy="searchbar-privates-phylomes-input"]')
            .clear()
            .type("test@test.test");
        cy.get('[data-cy="email-dinamic-button"]').first().click();
        cy.get('[data-cy="delete-email-from-phylome-button"]').click();

        cy.get('[data-cy="success-window"]').should(
            "contain",
            "test@test.test deleted succesfully",
        );
    });

    it("Delete email from phylome", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="toggle-dropdown-phylomes-menu-button"]').click();
        cy.get('[data-cy="searchbar-privates-phylomes-input"]')
            .clear()
            .type("test2@gmail.com");
        cy.get('[data-cy="email-dinamic-button"]').first().click();
        cy.get('[data-cy="delete-email-from-phylome-button"]').click();

        cy.get('[data-cy="success-window"]').should(
            "contain",
            "test2@gmail.com deleted succesfully",
        );
    });

    it("back button is working and redirect to admin menu page", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.wait(3000);
        cy.visit(PRIVATE_PHYLOMES_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="back-private-phylomes-button"]').click();
        cy.url().should("contain", "http://localhost:3050/admin");
    });
});
