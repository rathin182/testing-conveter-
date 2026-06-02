export const engineerStatusData = {
  APPROVED: [
    {
      reason: "Onboarding Success",
      tags: [
        { label: "Welcome", message: "Congratulations! Your application has been verified and approved. You can now access your dashboard and start bidding on projects." },
        { label: "Fast-Track", message: "Welcome aboard! Your profile has been fast-tracked for approval due to your impressive technical background. Welcome to the team!" }
      ]
    },
    {
      reason: "Expertise Recognized",
      tags: [
        { label: "Niche Expert", message: "Your specialized expertise is a perfect match for our current high-demand projects. We are thrilled to have you onboard." },
        { label: "Top-Tier Profile", message: "Your professional profile and verified experience have been rated as top-tier. You are now authorized to apply for premium client projects." }
      ]
    },
    {
      reason: "Portfolio Excellence",
      tags: [
        { label: "Outstanding Projects", message: "The projects you showcased in your portfolio demonstrate exactly the hands-on skill set we need. Welcome to the platform." }
      ]
    }
  ],
  REJECTED: [
    {
      reason: "Documentation Issues",
      tags: [
        { label: "Missing ID", message: "Your application was rejected because the identification document provided was unclear or expired. Please upload a valid ID." },
        { label: "Incomplete Profile", message: "Your application was rejected due to an incomplete profile. Please provide more details regarding your work experience and skills." }
      ]
    },
    {
      reason: "Qualification Mismatch",
      tags: [
        { label: "Requirements", message: "We are unable to approve your application at this time as your qualifications do not match our current project requirements." },
        { label: "Experience", message: "We require more verified professional experience in embedded systems to approve your application." }
      ]
    },
    {
      reason: "Professionalism & Policy",
      tags: [
        { label: "Unresponsive", message: "We were unable to establish reliable communication during the screening process, which is critical for our client projects." },
        { label: "Policy Violation", message: "Your application was rejected due to inconsistencies found in your background verification, which violates our platform safety policy." }
      ]
    },
    {
      reason: "Market Availability",
      tags: [
        { label: "Capacity Full", message: "Currently, our platform is at full capacity for your primary skill set. We will keep your profile in our database and notify you if a spot opens up." },
        { label: "Skill Redundancy", message: "We currently have a surplus of engineers with your specific skill profile and are not accepting new applicants in this category at the moment." }
      ]
    }
  ]
};