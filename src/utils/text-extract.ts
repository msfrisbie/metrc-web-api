const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`)
console.log(dom.window.document.querySelector('p').textContent) // "Hello world"

export function extractOrNull(regex: string, text: string): string | null {
  const match = text.match(regex)

  if (!match) {
    return null
  }

  return match[1]
}

export function extractOrError(regex: string, text: string): string {
  const match = extractOrNull(regex, text)

  if (!match) {
    throw new Error('Match not found')
  }

  return match[1]
}

export function extractEmailFromUserProfileOrError(html: string): string {
  const dom = new JSDOM(html)

  const emailInput = dom.window.document.querySelector('input#email')

  const email = emailInput.getAttribute('value')

  if (!email) {
    throw new Error('Email not found')
  }

  return email
}

export function extractLicenseLinkPairsFromFacilityDropdown(html: string): any {
  // Assumes that the <a href> and <small> pairs are colocated
  // returns {license_number: link}
  const dom = new JSDOM(html)

  // Acquire anchor elements
  const links: string[] = dom.window.document
    .querySelectorAll('.facilities-dropdown a[href]')
    .map((x: any) => x.getAttribute('href'))

  // Acquire <small> text inside anchor elements
  const licenseNumbers: string[] = dom.window.document
    .querySelectorAll('.facilities-dropdown a[href] small')
    .map((x: any) => x.textContent().trim())

  const zip: { [key: string]: string } = {}

  for (let i = 0; i < links.length; ++i) {
    zip[licenseNumbers[i]] = links[i]
  }

  return zip
}

export function extractLicenseNumbersFromHtmlOrError(html: string): string[] {
  return Object.keys(extractLicenseLinkPairsFromFacilityDropdown(html))
}
