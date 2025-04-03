describe("Login page", () => {
    const LOGIN_URL = "http://localhost:3050/login";
    const TEST_TOKEN = Cypress.env("TEST_USER_TOKEN");
    const TEST_USER = Cypress.env("TEST_USER_EMAIL");

    console.log(process.env);

    if (!TEST_USER) {
        throw Error("Missing 'TEST_USER' email from the environment variables file!");
    } else if (!TEST_TOKEN) {
        throw Error("Missing 'TEST_USER' email from the environment variables file!");
    }

    it("Should successfully login with test token URL", () => {
        cy.visit(`${LOGIN_URL}?login_token=${TEST_TOKEN}`);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.url().should("include", "/");
        cy.wait(5000);
        cy.getCookie("token").should("exist");
    });

    it("Should show validation <please fill out this field> when no email inserted ", () => {
        cy.visit(LOGIN_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="submit"]').click();
        cy.get('[data-cy="email-input"]').click().should("exist");
    });

    it("Should send email validation to user with a request 200 status", () => {
        cy.visit(LOGIN_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="email-input"]').type(TEST_USER);
        cy.get('[data-cy="submit"]').click();
        cy.get('[data-cy="success-window"]').should(
            "contain",
            "Login link has been sent successfully to",
        );
    });

    it("Should show error when an invalid email format is entered", () => {
        cy.visit(LOGIN_URL);
        cy.get('[data-cy="cookie-accept-button"]').first().click();
        cy.get('[data-cy="email-input"]').type("invalid-email");
        cy.get('[data-cy="submit"]').click();
        cy.get('[data-cy="email-input"]').then(($input) => {
            const input = $input[0] as HTMLInputElement;
            expect(input.validationMessage).to.eq(
                "Please include an '@' in the email address. 'invalid-email' is missing an '@'.",
            );
        });
    });
});
