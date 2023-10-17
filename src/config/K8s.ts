// TerraForm Image to use
export const K8S_TF_IMAGE: string = process.env.K8S_TF_IMAGE || 'hashicorp/terraform';

// TerraForm Image pull policy
export const K8S_TF_IMAGE_PP: string = process.env.K8S_TF_IMAGE_PP || 'IfNotPresent';

// K8s Namespace to use with TerraForm
export const K8S_TF_NS: string = process.env.K8S_TF_NS || 'terraform';

// Set variables for Resource Management
export const NB_COUNT_FACTOR: number = Number(process.env.NB_COUNT_FACTOR) || 1;
export const NB_COUNT_MIN_ADD: number = Number(process.env.NB_COUNT_MIN_ADD) || 0;
export const NB_LIMITS_FACTOR: number = Number(process.env.NB_LIMITS_FACTOR) || 1;
export const NB_GUARANTEES_FACTOR: number = Number(process.env.NB_GUARANTEES_FACTOR) || 0.5;
export const NB_MIN_RAM: number = Number(process.env.NB_MIN_RAM) || 0.25;
export const NB_MIN_CPU: number = Number(process.env.NB_MIN_CPU) || 0.25;
export const NS_LIMITS_FACTOR: number = Number(process.env.NS_LIMITS_FACTOR) || 1;
export const NS_RAM_STATIC: number = Number(process.env.NS_RAM_STATIC) || 2;
export const NS_CPU_STATIC: number = Number(process.env.NS_CPU_STATIC) || 2;
