## Declaring request and response types
We should add these under `types` folder in `request` and `response` folders. Use the file specific to the entity.

- Make sure 

## Form Validation

### Form Validation Process Documentation

#### Overview

This document outlines a structured approach to form validation within our Next.js application, designed to ensure consistency and maintainability across different forms. It describes a method for validating forms based on mandatory fields, utilizing an interface for field definitions and a helper function for validation. It's important to note that while `validateCategory` is used here for illustration purposes, the actual function name will vary according to the form being validated.

#### Interface Definition

For each form requiring validation, we define an interface within `error.ts` that enumerates all mandatory fields. For example, in a form for creating a category where "name" and "excerpt" are mandatory, these fields would be included in the interface. This interface acts as a foundation for the validation process, ensuring all required checks are implemented.

#### Helper Function: Example `validateCategory`

At the heart of our validation approach is a helper function exemplified here as `validateCategory`. This function's purpose is to validate the form's inputs against the criteria specified in our interface, determining if the mandatory fields are adequately completed.

**Functionality:**

- The function evaluates each mandatory field for completeness and correctness.
- An error object is populated based on the validation outcome, identifying any fields that fail the validation.
- It returns a boolean indicating the form's validity. This boolean is essential for managing form submission and for displaying error messages where necessary.

#### Usage

The validation function (e.g., `validateCategory` in this example) should be invoked with the form's current state as input prior to submission. Depending on the return value:

- A return value of `true` indicates that the form meets all validation criteria, allowing for submission.
- A return value of `false` signals the presence of validation errors. The accompanying error object, detailed by the function, should then be used to guide error display in the UI, informing users about which fields require attention.

## Server Side Rendering (SSR) in Nextjs

Nextjs supports server side rendering. This means that the UI is rendered on the server and then sent to the client which makes the rendering of the components faster.

Here is a video explanation on a top level [What is SSR & how to achieve it?](https://drive.google.com/file/d/1Qj7JJLJB4gx0pgH_4T-vpNG3-pREIlE1/view?usp=sharing):

Here is a coding example of [Converting Client Side to Server Side Rendering](https://drive.google.com/file/d/1jqD-EZL70sYXH-A7NnL7EQ9A1Mr09rjz/view?usp=sharing).

[![What is SSR and how to achieve it?](https://miro.medium.com/v2/resize:fit:1400/1*7TEKaVM6HhAHl0uDc4kjSw.gif)](https://drive.google.com/file/d/1Qj7JJLJB4gx0pgH_4T-vpNG3-pREIlE1/view?usp=sharing)
