const TEST_CASES = {
  x0001: `<div lang="nl-BE" about="http://test.com/1" property="http://test.com/content">test</div>`,
  x0002: `
  <div lang="nl-BE" resource="http://test.com/1" property="http://test.com/content">test</div>
`,
  x0003: `
  <div lang="nl-BE" resource="http://test.com/1" ><span property="ext:foo">test</span></div>
`,
  x0004: `
  <div lang="nl-BE" resource="http://test.com/1" typeof="http://test.com/Type" ><span property="ext:foo">test</span></div>
`,
  x0005: `
  <div lang="nl-BE" resource="http://test.com/1" typeof="ext:Type" ><span property="ext:foo">test</span></div>
`,
  title: `
  <div lang="nl-BE" data-say-document="true"><div property="say:hasPart" typeof="say:Title" resource="http://data.lblod.info/titles/6112780c-ed34-4cea-8bc7-b00286b917d7"><h3 property="say:heading" data-number-display-style="roman"><span property="eli:number" datatype="xsd:integer" content="1" contenteditable="false">I</span><span contenteditable="false">. </span><span property="ext:title">This is a Title</span></h3><div property="say:body"><p>This is some content</p></div></div></div>
`,
  // The content of the body changes as it's an rdf:XMLLiteral and that means it includes the HTML
  // within it, which is changed to include hidden elements
  // titleWithDatatype: `
  // <div lang="nl-BE" data-say-document="true"><div property="say:hasPart" typeof="say:Title" resource="http://data.lblod.info/titles/6112780c-ed34-4cea-8bc7-b00286b917d7"><h3 property="say:heading" data-number-display-style="roman"><span property="eli:number" datatype="xsd:integer" content="1" contenteditable="false">I</span><span contenteditable="false">. </span><span property="ext:title">This is a Title</span></h3><div property="say:body" datatype="rdf:XMLLiteral"><p>This is some content</p></div></div></div>
  // `,
  // minimalRegulatoryStatement: `
  //     <div lang="nl-BE" data-say-document="true"><div property="say:hasPart" typeof="say:Chapter" resource="http://data.lblod.info/chapters/a222f3a1-ba25-4052-9ff2-b62d76e2c49c"><h4 property="say:heading" data-number-display-style="roman"><span property="eli:number" datatype="xsd:integer" content="1" contenteditable="false">I</span><span contenteditable="false">. </span><span property="ext:title">Chapter Title</span></h4><div property="say:body" datatype="rdf:XMLLiteral"><div property="say:hasPart" typeof="say:Section" resource="http://data.lblod.info/sections/fd26dcb7-f23f-4043-9792-c4dc6cf007e8"><h5 property="say:heading" data-number-display-style="roman"><span property="eli:number" datatype="xsd:integer" content="1" contenteditable="false">I</span><span contenteditable="false">. </span><span property="ext:title">Section Title</span></h5><div property="say:body" datatype="rdf:XMLLiteral"><div property="say:hasPart" typeof="say:Article" resource="http://data.lblod.info/articles/6f66c684-ed89-4349-a732-23241289d3cc"><div property="say:heading" data-number-display-style="decimal">Artikel <span property="eli:number" datatype="xsd:integer" content="1" contenteditable="false">1</span><span contenteditable="false">: </span><span property="ext:title">Article Title</span></div><div property="say:body" datatype="rdf:XMLLiteral"><p>Article content.</p></div></div></div></div></div></div></div>
  // `,
};

export default TEST_CASES;
