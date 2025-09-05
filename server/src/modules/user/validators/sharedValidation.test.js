const { expect } = require("chai");
const {
  sharedValidation,
  getJoiValidation,
  getMongooseValidation,
  createJoiSchema,
  createMongooseFields,
} = require("./sharedValidation");

describe("Shared Validation System", () => {
  describe("getJoiValidation", () => {
    it("should return required Joi validation for email", () => {
      const emailValidation = getJoiValidation("email", true);
      expect(emailValidation).to.be.an("object");
      expect(emailValidation._flags.presence).to.equal("required");
    });

    it("should return optional Joi validation for email", () => {
      const emailValidation = getJoiValidation("email", false);
      expect(emailValidation).to.be.an("object");
      expect(emailValidation._flags.presence).to.equal("optional");
    });

    it("should throw error for unknown field", () => {
      expect(() => getJoiValidation("unknownField", true)).to.throw(
        "No shared validation found for field: unknownField"
      );
    });
  });

  describe("getMongooseValidation", () => {
    it("should return Mongoose validation for email", () => {
      const emailValidation = getMongooseValidation("email");
      expect(emailValidation).to.be.an("object");
      expect(emailValidation.type).to.equal("String");
      expect(emailValidation.required).to.be.true;
      expect(emailValidation.unique).to.be.true;
    });

    it("should apply overrides to Mongoose validation", () => {
      const emailValidation = getMongooseValidation("email", { index: true });
      expect(emailValidation.index).to.be.true;
    });

    it("should throw error for unknown field", () => {
      expect(() => getMongooseValidation("unknownField")).to.throw(
        "No shared validation found for field: unknownField"
      );
    });
  });

  describe("createJoiSchema", () => {
    it("should create Joi schema from field configuration", () => {
      const schema = createJoiSchema({
        email: true,
        password: false,
        firstName: { required: true, field: "name" },
      });

      expect(schema).to.be.an("object");
      expect(schema._ids._byKey).to.have.property("email");
      expect(schema._ids._byKey).to.have.property("password");
      expect(schema._ids._byKey).to.have.property("firstName");
    });
  });

  describe("createMongooseFields", () => {
    it("should create Mongoose fields from field configuration", () => {
      const fields = createMongooseFields({
        email: true,
        password: false,
        firstName: { required: true, field: "name" },
      });

      expect(fields).to.be.an("object");
      expect(fields.email).to.be.an("object");
      expect(fields.password).to.be.an("object");
      expect(fields.firstName).to.be.an("object");
    });
  });

  describe("Validation Consistency", () => {
    it("should have consistent validation rules between Joi and Mongoose", () => {
      // Test email validation consistency
      const joiEmail = sharedValidation.email.joi;
      const mongooseEmail = sharedValidation.email.mongoose;

      expect(joiEmail._flags.presence).to.equal("required");
      expect(mongooseEmail.required).to.be.true;
      expect(mongooseEmail.type).to.equal("String");

      // Test password validation consistency
      const joiPassword = sharedValidation.password.joi;
      const mongoosePassword = sharedValidation.password.mongoose;

      expect(joiPassword._flags.presence).to.equal("required");
      expect(mongoosePassword.required).to.be.a("function");
      expect(mongoosePassword.type).to.equal("String");
    });

    it("should have consistent enum values for role", () => {
      const joiRole = sharedValidation.role.joi;
      const mongooseRole = sharedValidation.role.mongoose;

      expect(joiRole._valids._set).to.include("customer");
      expect(joiRole._valids._set).to.include("seller");
      expect(joiRole._valids._set).to.include("admin");

      expect(mongooseRole.enum.values).to.include("customer");
      expect(mongooseRole.enum.values).to.include("seller");
      expect(mongooseRole.enum.values).to.include("admin");
    });
  });

  describe("Field Mapping", () => {
    it("should correctly map firstName and lastName to name validation", () => {
      const firstNameValidation = getJoiValidation("name", true);
      const lastNameValidation = getJoiValidation("name", true);

      expect(firstNameValidation).to.be.an("object");
      expect(lastNameValidation).to.be.an("object");
      expect(firstNameValidation._flags.presence).to.equal("required");
      expect(lastNameValidation._flags.presence).to.equal("required");
    });
  });
});
