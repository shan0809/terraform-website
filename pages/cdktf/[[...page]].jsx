import { productName, productSlug } from 'data/metadata'
import DocsPage from '@hashicorp/react-docs-page'
import otherDocsData from 'data/other-docs-nav-data.json'
// Imports below are only used server-side
import {
  generateStaticPaths,
  generateStaticProps,
} from '@hashicorp/react-docs-page/server'
import visit from 'unist-util-visit'
import path from 'path'

//  Configure the docs path
const BASE_ROUTE = 'cdktf'
const NAV_DATA = 'data/cdktf-nav-data.json'
const CONTENT_DIR = 'content/cdktf'
const PRODUCT = { name: productName, slug: 'terraform-cdk' }

export default function CDKLayout(props) {
  // add the "other docs" section to the bottom of the nav data
  const modifiedProps = Object.assign({}, props)
  modifiedProps.navData = modifiedProps.navData.concat(otherDocsData)

  return (
    <DocsPage
      baseRoute={BASE_ROUTE}
      product={PRODUCT}
      staticProps={modifiedProps}
    />
  )
}

export async function getStaticPaths() {
  const paths = await generateStaticPaths({
    navDataFile: NAV_DATA,
    localContentDir: CONTENT_DIR,
  })
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const props = await generateStaticProps({
    navDataFile: NAV_DATA,
    localContentDir: CONTENT_DIR,
    params,
    product: PRODUCT,
    remarkPlugins: [
      () => {
        const product = 'terraform-cdk'
        const version = 'main'
        return function transform(tree) {
          visit(tree, 'image', (node) => {
            const assetPath = params.page
              ? path.posix.join(
                  ...params.page,
                  node.url.startsWith('.') ? `.${node.url}` : `../${node.url}`
                )
              : node.url
            const asset = path.posix.join('website/docs/cdktf', assetPath)
            node.url = `https://mktg-content-api.vercel.app/api/assets?product=${product}&version=${version}&asset=${asset}`
          })
        }
      },
    ],
    githubFileUrl(path) {
      const filepath = path.replace('content/', '')
      return `https://github.com/hashicorp/${PRODUCT.slug}/blob/main/website/docs/${filepath}`
    },
  })
  return { props }
}
