export default {
  slug: "jupyter",
  attributes: {
    notebook_image: {
      label: "Notebook Image",
      type: String,
      default: "jupyter/scipy-notebook",
      validationRules: {
        nullable: false
      },
      tf_variable: "notebook_image"
    }
  },
  tf_module: process.env.JUPYTER_TF_MODULE,
  tf_registry: process.env.JUPYTER_TF_REGISTRY,
  tf_access_token: process.env.JUPYTER_TF_ACCESS_TOKEN,
}
