export const metadata = {
    title: "Privacy Policy",
    description:
        "Read the Privacy Policy of PhylomeDB to understand how we collect, use, and protect your personal information.",
};

export default function Page() {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-white">
            <img
                alt="phylomedb icon"
                width={150}
                height={150}
                src="/logos/phylomedb-logo-lg.webp"
                className="mb-5"
            />
            <h1 className="text-2xl">PhylomeDB Privacy Policy</h1>
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <p>
                    Your privacy is critically important to us. At Automattic,
                    we have a few fundamental principles:
                </p>
                <ul>
                    <li>
                        We are thoughtful about the personal information we ask
                        you to provide and the personal information that we
                        collect about you through the operation of our service.
                    </li>
                    <li>
                        We store personal information for only as long as we
                        have a reason to keep it.
                    </li>
                    <li>
                        We aim to make it as simple as possible for you to
                        control what information on your website is shared
                        publicly (or kept private), indexed by search engines,
                        and permanently deleted.
                    </li>
                    <li>
                        We aim for full transparency on how we gather, use, and
                        share your personal information.
                    </li>
                </ul>
                <p>
                    Below is our Privacy Policy, which incorporates and
                    clarifies these principles.
                </p>
            </div>
            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">
                    Who We Are and What This Policy Covers
                </h2>
                <p>
                    PhylomeDB is a public database for complete catalogs of gene
                    phylogenies (phylomes). It allows users to interactively
                    explore the evolutionary history of genes through the
                    visualization of phylogenetic trees and multiple sequence
                    alignments. Moreover, phylomeDB provides genome-wide
                    orthology and paralogy predictions which are based on the
                    analysis of the phylogenetic trees. The automated pipeline
                    used to reconstruct trees aims at providing a high-quality
                    phylogenetic analysis of different genomes, including
                    Maximum Likelihood tree inference, alignment trimming and
                    evolutionary model testing. PhylomeDB includes also a public
                    download section with the complete set of trees, alignments
                    and orthology predictions. Finally, phylomeDB provides an
                    advanced tree visualization interface based on the ETE
                    toolkit, which integrates tree topologies, taxonomic
                    information, domain mapping and alignment visualization in a
                    single and interactive tree image.
                </p>
                <p>
                    This Privacy Policy applies to information that we collect
                    about you when you use our website, https://phylomedb.org.
                </p>
                <p>
                    Throughout this Privacy Policy we'll refer to our website
                    collectively as "Service."
                </p>
                <p>
                    Below we explain how we collect, use, and share information
                    about you, along with the choices that you have with respect
                    to that information.
                </p>
                <h2 className="text-xl font-bold">
                    Creative Commons Sharealike License
                </h2>
                <p>
                    We've decided to make this Privacy Policy available under a{" "}
                    <a href="https://creativecommons.org/licenses/by-sa/4.0/">
                        Creative Commons Sharealike
                    </a>{" "}
                    license. You can grab a copy of this Privacy Policy and
                    other legal documents on{" "}
                    <a href="https://github.com/Automattic/legalmattic">
                        GitHub
                    </a>
                    . You're more than welcome to copy it, adapt it, and
                    repurpose it for your own use. Just make sure to revise the
                    language so that your policy reflects your actual practices.
                    If you do use it, we'd appreciate a credit and link to
                    Automattic somewhere on your site.
                </p>
                <h2 className="text-xl font-bold">Information We Collect</h2>
                <p>
                    We only collect information about you if we have a reason to
                    do so — for example, to provide our Service, to communicate
                    with you, or to make our Service better.
                </p>
                <p>
                    We collect this information from three sources: if and when
                    you provide information to us, automatically through
                    operating our Service.. Let's go over the information that
                    we collect.
                </p>
            </div>

            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">
                    Information You Provide to Us
                </h2>
                <p>
                    It's probably no surprise that we collect information that
                    you provide to us directly. Here are some examples:
                </p>
                <ul>
                    <li>
                        Basic account information: We ask for basic information
                        from you in order to set up your account. For example,
                        we require individuals who sign up for a phylomedb.org
                        account to provide an email address and password, along
                        with a username or name — and that's it. You may provide
                        us with more information — like your address and other
                        information you want to share — but we don't require
                        that information to create a phylomedb.org account.
                    </li>
                    <li>
                        Communications with us (hi there!): You may also provide
                        us with information when you respond to surveys,
                        communicate with our Happiness Engineers about a support
                        question, post a question in our public forums, or sign
                        up for a newsletter like the one we send through
                        Longreads. When you communicate with us via form, email,
                        phone, phylomedb.org comment, or otherwise, we store a
                        copy of our communications (including any call
                        recordings as permitted by applicable law).
                    </li>
                </ul>
            </div>

            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">
                    Information We Collect Automatically
                </h2>
                <p>We also collect some information automatically:</p>
                <ul>
                    <li>
                        Log information: Like most online service providers, we
                        collect information that web browsers, mobile devices,
                        and servers typically make available, including the
                        browser type, IP address, unique device identifiers,
                        language preference, referring site, the date and time
                        of access, operating system, and mobile network
                        information. We collect log information when you use our
                        Service — for example, when you create or make changes
                        to your website on WordPress.com.
                    </li>
                    <li>
                        Usage information: We collect information about your
                        usage of our Service. For example, we collect
                        information about the actions that site administrators
                        and users perform on a site using our phylomedb.org or
                        Jetpack service — in other words, who did what and when
                        (e.g., [phylomedb.org username] deleted "[title of
                        post]" at [time/date]).
                    </li>
                    <li>
                        Location information: We may determine the approximate
                        location of your device from your IP address. We collect
                        and use this information to, for example, calculate how
                        many people visit our Service from certain geographic
                        regions.
                    </li>
                </ul>
                <p>
                    The information we receive depends on which service you use
                    or authorize and what options are available.
                </p>
            </div>

            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">
                    How and Why We Use Information
                </h2>
                <h3 className="text-lg py-3 font-semibold">
                    Purposes for Using Information
                </h3>
                <p>
                    We use information about you for the purposes listed below:
                </p>
                <ul>
                    <li>
                        To provide our Service. For example, to set up and
                        maintain your account, backup and restore your saved
                        contents and verify user information.
                    </li>
                    <li>
                        To ensure quality, maintain safety, and improve our
                        Service. For example, by providing automatic upgrades
                        and new versions of our Service. Or, for example, by
                        monitoring and analyzing how users interact with our
                        Service so we can create new features that we think our
                        users will enjoy and that will help them create and
                        manage websites more efficiently or make our Service
                        easier to use.
                    </li>
                    <li>
                        To protect our Service, our users, and the public. For
                        example, by detecting security incidents; detecting and
                        protecting against malicious, deceptive, fraudulent, or
                        illegal activity; fighting spam; complying with our
                        legal obligations; and protecting the rights and
                        property of Automattic and others, which may result in
                        us, for example terminating Service.
                    </li>
                    <li>
                        To fix problems with our Service. For example, by
                        monitoring, debugging, repairing, and preventing issues.
                    </li>
                </ul>
                <h3 className="text-lg py-3 font-semibold">
                    Legal Bases for Collecting and Using Information
                </h3>
                <p>
                    A note here for those in the European Union about our legal
                    grounds for processing information about you under EU data
                    protection laws, which is that our use of your information
                    is based on the grounds that:
                </p>
                <ol>
                    <li>
                        (1) The use is necessary in order to fulfill our
                        commitments to you under the applicable terms of service
                        or other agreements with you or is necessary to
                        administer your account — for example, in order to
                        enable access to our website on your device or charge
                        you for a paid plan; or
                    </li>
                    <li>
                        (2) The use is necessary for compliance with a legal
                        obligation; or
                    </li>
                    <li>
                        (3) The use is necessary in order to protect your vital
                        interests or those of another person; or
                    </li>
                    <li>
                        (4) We have a legitimate interest in using your
                        information — for example, to provide and update our
                        Service; to improve our Service so that we can offer you
                        an even better user experience; to safeguard our
                        Service; to communicate with you; to measure, gauge, and
                        improve the effectiveness of our advertising; and to
                        understand our user retention and attrition; to monitor
                        and prevent any problems with our Service; and to
                        personalize your experience; or
                    </li>
                    <li>
                        (5) You have given us your consent — for example before
                        we place certain cookies on your device and access and
                        analyze them later on, as described in our [Cookie
                        Policy](http://www.automattic.com/cookies).
                    </li>
                </ol>
            </div>

            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">Sharing Information</h2>
                <h3 className="text-lg py-3 font-semibold">
                    How We Share Information
                </h3>
                <p>
                    We share information about you in limited circumstances, and
                    with appropriate safeguards on your privacy. These are
                    spelled out below, as well as in the section called [Ads and
                    Analytics Service Provided by
                    Others](https://automattic.com/privacy/#ads-and-analytics-service-provided-by-others):
                </p>
                <ul>
                    <li>
                        Legal and regulatory requirements: We may disclose
                        information about you in response to a subpoena, court
                        order, or other governmental request. For more
                        information on how we respond to requests for
                        information about phylomedb.org users, please see our
                        [Legal
                        Guidelines](https://en.support.wordpress.com/report-blogs/legal-guidelines/).
                        Additionally, if you have a domain registered with
                        WordPress.com, we may share your information to comply
                        with the Internet Corporation for Assigned Names and
                        Numbers' (ICANN) regulations, rules, or policies. For
                        example, your information relating to your domain
                        registration may be available in the WHOIS database, or
                        we may be required to share your information with
                        ICANN-approved Dispute Resolution Service Providers.
                        Please see our [Domain Registrations and Privacy support
                        document](https://en.support.wordpress.com/domains/domain-registrations-and-privacy/)
                        for more details.
                    </li>
                    <li>
                        To protect rights, property, and others: We may disclose
                        information about you when we believe in good faith that
                        disclosure is reasonably necessary to protect the
                        property or rights of Automattic, third parties, or the
                        public at large. For example, if we have a good faith
                        belief that there is an imminent danger of death or
                        serious physical injury, we [may disclose information
                        related to the emergency without
                        delay](https://en.support.wordpress.com/report-blogs/legal-guidelines/#emergency-requests-from-government-agencieslaw-enforcement).
                    </li>
                    <li>
                        With your consent: We may share and disclose information
                        with your consent or at your direction. For example, we
                        may share your information with third parties when you
                        authorize us to do so, like when you connected your site
                        to a social media service through our Publicize feature.
                    </li>
                    <li>
                        Aggregated or de-identified information: We may share
                        information that has been aggregated or de-identified,
                        so that it can no longer reasonably be used to identify
                        you. For instance, we may publish aggregate statistics
                        about the use of our Service, or share a hashed version
                        of your email address to facilitate customized ad
                        campaigns on other platforms.
                    </li>
                    <li>
                        Site owners: If you have a phylomedb.org account and
                        interact with another site using our Service, your
                        information may be shared with the administrators of the
                        site. For example, if you leave a comment on a site
                        created on phylomedb.org or running Jetpack, your IP
                        address and the email address associated with your
                        phylomedb.org account may be shared with the
                        administrator(s) of the site where you left the comment.
                    </li>
                    <li>
                        Published support requests: If you send us a request for
                        assistance (for example, via a support email or one of
                        our other feedback mechanisms), we reserve the right to
                        publish that request in order to clarify or respond to
                        your request, or to help us support other users.
                    </li>
                </ul>
                <h3 className="text-lg py-3 font-semibold">
                    Information Shared Publicly
                </h3>
                <p>
                    Information that you choose to make public is — you guessed
                    it — disclosed publicly.
                </p>
                <p>
                    That means information like your public profile, posts,
                    other content that you make public on your website, and your
                    "Likes" and comments on other websites are all available to
                    others — and we hope they get a lot of views!
                </p>
                <p>
                    Please keep all of this in mind when deciding what you would
                    like to share publicly.
                </p>
            </div>

            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">
                    How Long We Keep Information
                </h2>
                <p>
                    We generally discard information about you when it's no
                    longer needed for the purposes for which we collect and use
                    it — described in the section above on How and Why We Use
                    Information — and we're not legally required to keep it.
                </p>
                <p>
                    For example, we keep web server logs that record information
                    about a visitor to one of PhylomeDB's websites, like the
                    visitor's IP address, browser type, and operating system,
                    for approximately 30 days. We retain the logs for this
                    period of time in order to, among other things, analyze
                    traffic to PhylomeDB's websites and investigate issues if
                    something goes wrong on one of our websites.
                </p>
                <p>
                    As another example, when you delete a post, page, or comment
                    from your phylomedb.org site, it stays in your Trash folder
                    for thirty days in case you change your mind and would like
                    to restore that content, because starting from scratch is no
                    fun. After the thirty days are up, the deleted content may
                    remain on our backups and caches until purged.
                </p>
            </div>

            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">Security</h2>
                <p>
                    While no online service is 100% secure, we work very hard to
                    protect information about you against unauthorized access,
                    use, alteration, or destruction, and take reasonable
                    measures to do so. We monitor our Service for potential
                    vulnerabilities and attacks.
                </p>
            </div>

            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">Choices</h2>
                <p>
                    You have several choices available when it comes to
                    information about you:
                </p>
                <ul>
                    <li>
                        Limit the information that you provide: If you have an
                        account with us, you can choose not to provide the
                        optional account information, profile information.
                        Please keep in mind that if you do not provide this
                        information, certain features of our Service may not be
                        accessible.
                    </li>
                    <li>
                        Set your browser to reject cookies: At this time,
                        Automattic does not respond to "do not track" signals
                        across all of our Service. However, you can [usually
                        choose](https://automattic.com/cookies/#controlling-cookies)
                        to set your browser to remove or reject browser cookies
                        before using PhylomeDB's website, with the drawback that
                        certain features of PhylomeDB's websites may not
                        function properly without the aid of cookies.
                    </li>
                    <li>
                        Opt out of our internal analytics program: You can do
                        this through your user settings. By opting out, you will
                        stop sharing information with our analytics tool about
                        events or actions that happen after the opt-out, while
                        you're logged in to your phylomedb.org account.
                    </li>
                    <li>
                        Close your account: While we'd be very sad to see you
                        go, you can close your account if you no longer want to
                        use our Service.
                    </li>
                </ul>
            </div>
            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">Your Rights</h2>
                <p>
                    If you are located in certain parts of the world, including
                    some US states and countries that fall under the scope of
                    the European General Data Protection Regulation (aka the
                    "GDPR"), you may have certain rights regarding your personal
                    information, like the right to request access to or deletion
                    of your data.
                </p>
            </div>
            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">
                    European General Data Protection Regulation (GDPR)
                </h2>
                <p>
                    If you are located in a country that falls under the scope
                    of the GDPR, data protection laws give you certain rights
                    with respect to your personal data, subject to any
                    exemptions provided by the law, including the rights to:
                </p>
                <ul>
                    <li>Request access to your personal data;</li>
                    <li>
                        Request correction or deletion of your personal data;
                    </li>
                    <li>
                        Object to our use and processing of your personal data;
                    </li>
                    <li>
                        Request that we limit our use and processing of your
                        personal data; and
                    </li>
                    <li>Request portability of your personal data.</li>
                </ul>
                <p>
                    You also have the right to make a complaint to a government
                    supervisory authority.
                </p>
                <h3 className="text-lg py-3 font-semibold">US Privacy Laws</h3>
                <p>
                    Laws in some US states require us to provide residents with
                    additional information about the categories of personal
                    information we collect and share, where we get that personal
                    information, and how and why we use it. You'll find that
                    information in this section (if you are a California
                    resident, please note that this is the Notice at Collection
                    we are required to provide you under California law).
                </p>
                <h2 className="text-xl font-bold">
                    Contacting Us About These Rights
                </h2>
                <p>
                    You can usually access, correct, or delete your personal
                    data using your account settings and tools that we offer,
                    but if you aren't able to or you'd like to contact us about
                    one of the other rights, you can e-mail to
                    "gabaldonlab@gmail.com".
                </p>
                <p>
                    When you contact us about one of your rights under this
                    section, we'll need to verify that you are the right person
                    before we disclose or delete anything. For example, if you
                    are a user, we will need you to contact us from the email
                    address associated with your account. You can also designate
                    an authorized agent to make a request on your behalf by
                    giving us written authorization. We may still require you to
                    verify your identity with us.
                </p>
                <h3 className="text-lg py-3 font-semibold">
                    Appeals Process for Rights Requests Denials
                </h3>
                <p>
                    In some circumstances we may deny your request to exercise
                    one of these rights. For example, if we cannot verify that
                    you are the account owner we may deny your request to access
                    the personal information associated with your account. As
                    another example, if we are legally required to maintain a
                    copy of your personal information we may deny your request
                    to delete your personal information.
                </p>
                <p>
                    In the event that we deny your request, we will communicate
                    this fact to you in writing. You may appeal our decision by
                    responding in writing to our denial email and stating that
                    you would like to appeal. All appeals will be reviewed by an
                    internal expert who was not involved in your original
                    request. In the event that your appeal is also denied this
                    information will be communicated to you in writing.
                </p>
                <p>
                    If your appeal is denied, in some US states you may refer
                    the denied appeal to the state attorney general if you
                    believe the denial is in conflict with your legal rights.
                    The process for how to do this will be communicated to you
                    in writing at the same time we send you our decision about
                    your appeal.
                </p>
            </div>
            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">How to Reach Us</h2>
                <p>
                    If you have a question about this Privacy Policy, or you
                    would like to contact us about any of the rights mentioned
                    in the{" "}
                    <a href="https://phylomedb.org/privacy-policy">
                        Your Rights section
                    </a>{" "}
                    above, you can e-mail us via "gabaldonlab@gmail.com".
                </p>
            </div>
            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">
                    Ads and Analytics Service Provided by Others
                </h2>
                <p>
                    Ads appearing on any of our Service may be delivered by
                    advertising networks. Other parties may also provide
                    analytics service via our Service. These ad networks and
                    analytics providers may set tracking technologies (like
                    cookies) to collect information about your use of our
                    Service and across other websites and online service. These
                    technologies allow these third parties to recognize your
                    device to compile information about you or others who use
                    your device. This information allows us and other companies
                    to, among other things, analyze and track usage, determine
                    the popularity of certain content, and deliver ads that may
                    be more targeted to your interests. Please note this Privacy
                    Policy only covers the collection of information by
                    Automattic and does not cover the collection of information
                    by any third-party advertisers or analytics providers.
                </p>
            </div>
            <hr className="w-48 h-1 mx-auto my-1 bg-gray-100 border-0 rounded dark:bg-gray-700" />
            <div className="flex flex-col w-full justify-center items-start gap-2 py-4">
                <h2 className="text-xl font-bold">Privacy Policy Changes</h2>
                <p>
                    Although most changes are likely to be minor, PhylomeDB may
                    change its Privacy Policy from time to time. PhylomeDB
                    encourages visitors to frequently check this page for any
                    changes to its Privacy Policy. If we make changes, we will
                    notify you by revising the change log below, and, in some
                    cases, we may provide additional notice (like adding a
                    statement to our homepage or sending you a notification
                    through email or your dashboard). Your further use of the
                    Service after a change to our Privacy Policy will be subject
                    to the updated policy.
                </p>
            </div>
        </div>
    );
}
