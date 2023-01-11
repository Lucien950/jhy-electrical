import Tippy from "@tippyjs/react"
// icon images
const CommercialIcon = (props: any)=>(
	// <svg {...props} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512.001 512.001">
	// 	<g>
	// 		<g>
	// 			<path d="M489.692,198.569h-2.481c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723h-2.48
	// 				c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723h-2.481c-14.662,0-27.94-6.024-37.501-15.723
	// 				c-9.562,9.697-22.839,15.723-37.501,15.723h-2.48c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723
	// 				h-2.48c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723h-2.481
	// 				c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723h-2.48c-7.971,0-15.528-1.789-22.307-4.97v283.458
	// 				h73.158V236.618h129.512v240.439H512V193.599C505.221,196.781,497.662,198.569,489.692,198.569z M336.815,386.659h-80.389v-59.827
	// 				h80.389V386.659z M336.815,296.446h-80.389v-59.828h80.389V296.446z M447.59,386.659H367.2v-59.827h80.39V386.659z
	// 				M447.59,296.446H367.2v-59.828h80.39V296.446z"/>
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<rect x="464.903" y="34.944" width="47.098" height="76.825" />
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<rect x="387.419" y="34.944" width="47.098" height="76.825" />
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<rect x="309.935" y="34.944" width="47.098" height="76.825" />
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<rect x="232.452" y="34.944" width="47.098" height="76.825" />
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<rect x="154.968" y="34.944" width="47.098" height="76.825" />
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<rect x="77.484" y="34.944" width="47.098" height="76.825" />
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<polygon points="0,34.944 0,111.769 47.097,111.769 47.098,111.769 47.098,34.944 		" />
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<path d="M464.901,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
	// 				H464.901z"/>
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<path d="M387.417,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
	// 				H387.417z"/>
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<path d="M309.933,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
	// 				H309.933z"/>
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<path d="M232.449,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
	// 				H232.449z"/>
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<path d="M154.966,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
	// 				H154.966z"/>
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<path d="M77.484,142.154L77.484,142.154l-0.001,3.721c0,12.301,10.008,22.308,22.308,22.308h2.481
	// 				c12.301,0,22.308-10.007,22.308-22.308v-3.721H77.484z"/>
	// 		</g>
	// 	</g>
	// 	<g>
	// 		<g>
	// 			<path d="M0,142.154v3.721c0,12.301,10.007,22.308,22.307,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721H0z" />
	// 		</g>
	// 	</g>
	// </svg>
	<svg {...props} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 538.8 504">
		<path d="M447.6,228.1c0-6.8,5.5-12.4,12.4-12.4c6.8,0,12.4,5.5,12.4,12.4c0,17.5,4.6,33.1,11.9,44.3c6.2,9.5,14.4,15.4,23.4,15.6
		c22.8,0,31.2-11.4,31.2-28.2c0-48.2-51.8-133.7-77.6-176.2l-8.3-13.7H86.5l-24.7,44.3l-6.6,11.6C36.4,158.3,0,221.6,0,260.7
		c0,16,8.1,27.2,31.7,27.4c8.7-0.1,17-6,23.3-15.6c7.3-11.1,11.9-26.8,11.9-44.3c0-6.8,5.5-12.4,12.4-12.4c6.8,0,12.4,5.5,12.4,12.4
		c0,17.5,4.6,33.1,11.9,44.3c6.4,9.6,14.6,15.6,23.3,15.6s17-6,23.3-15.6c7.3-11.1,11.9-26.8,11.9-44.3c0-6.8,5.5-12.4,12.4-12.4
		c6.8,0,12.4,5.5,12.4,12.4l0,2.3c0.4,16.5,4.9,31.3,11.9,41.9c6.4,9.6,14.6,15.6,23.3,15.6s17-6,23.3-15.6
		c7.3-11.1,11.9-26.8,11.9-44.3c0-6.8,5.5-12.4,12.4-12.4s12.4,5.5,12.4,12.4c0,17.5,4.6,33.1,11.9,44.3c6.3,9.6,14.6,15.6,23.3,15.6
		s17-6,23.3-15.6c7.3-11.1,11.9-26.8,11.9-44.3c0-6.8,5.5-12.4,12.4-12.4s12.4,5.5,12.4,12.4c0,17.5,4.6,33.1,11.9,44.3
		c6.3,9.6,14.6,15.6,23.3,15.6s17-6,23.3-15.6C443,261.3,447.5,245.6,447.6,228.1L447.6,228.1z M269.6,396c19.3,0,36.9,7.9,49.7,20.6
		c12.7,12.7,20.6,30.3,20.6,49.7V504H495V311c-12.3-3.6-23.1-12.6-31.3-25c-1.3-2-2.5-4-3.7-6.2c-1.2,2.2-2.4,4.2-3.7,6.2
		c-10.9,16.5-26.4,26.8-43.9,26.8c-17.5,0-33-10.3-43.9-26.8c-1.3-2-2.5-4-3.7-6.2c-1.2,2.2-2.4,4.2-3.7,6.2
		c-10.9,16.5-26.4,26.8-43.9,26.8s-33-10.3-43.9-26.8c-1.3-2-2.5-4-3.7-6.2c-1.2,2.2-2.4,4.2-3.7,6.2c-10.9,16.5-26.4,26.8-43.9,26.8
		s-33-10.3-43.9-26.8c-1.3-2-2.5-4-3.7-6.2c-1.2,2.2-2.4,4.2-3.7,6.2c-10.9,16.5-26.4,26.8-43.9,26.8s-33-10.3-43.9-26.8
		c-1.3-2-2.5-4-3.7-6.2c-1.2,2.2-2.4,4.2-3.7,6.2c-8.3,12.6-19.3,21.6-31.7,25.1V504h155.5v-37.7c0-19.3,7.9-36.9,20.6-49.7
		C232.7,404,250.2,396,269.6,396L269.6,396z M269.6,420.8c-12.5,0-23.9,5.1-32.2,13.4c-8.2,8.2-13.4,19.7-13.4,32.2V504h91.1v-37.7
		c0-12.5-5.1-23.9-13.4-32.2S282.1,420.8,269.6,420.8L269.6,420.8z M447.6,0h-356v45.2h356V0z"/>
	</svg>
)
const IndustrialIcon = (props: any) =>(
	<svg {...props} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
		viewBox="0 0 330.02 330.02">
		<g id="XMLID_312_">
			<path id="XMLID_333_" d="M319.987,74.386C319.652,66.351,313.041,60.01,305,60.01h-26.51c-6.968-34.192-37.27-60-73.49-60
			c-0.107,0-0.212,0.014-0.318,0.016L15.002,0.01H15c-8.283,0-15,6.715-15,14.998c0,8.285,6.715,15.001,14.998,15.002l190.001,0.016
			H205c0.072,0,0.141-0.01,0.213-0.01c19.462,0.09,36.037,12.599,42.207,29.994H225c-8.041,0-14.652,6.341-14.987,14.376
			l-5.377,129.046l-79.029-79.028c-4.29-4.291-10.742-5.573-16.347-3.252c-5.606,2.321-9.26,7.792-9.26,13.858v63.786l-74.394-74.393
			c-4.29-4.291-10.742-5.575-16.347-3.252C3.654,123.473,0,128.943,0,135.01v180c0,8.284,6.716,15,15,15h200h100
			c0.007,0,0.015,0,0.02,0c8.285,0,15-6.716,15-15c0-0.478-0.021-0.95-0.065-1.416L319.987,74.386z"/>
		</g>
	</svg>
)

const ResidentialIcon = (props: any)=>(
	<svg {...props}  fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
)

const Commercial = ()=>(
	<Tippy content="Commercial" delay={200}>
		<span>
			<CommercialIcon className="w-8 h-8"/>
		</span>
	</Tippy>
)
const Industrial = ()=>(
	<Tippy content="Industrial" delay={200}>
		<span>
			<IndustrialIcon className="w-8 h-8"/>
		</span>
	</Tippy>
)

const Residential = ()=>(
	<Tippy content="Residential" delay={200}>
		<span>
			<ResidentialIcon className="w-8 h-8"/>
		</span>
	</Tippy>
)

export { Residential, Commercial, Industrial, ResidentialIcon, CommercialIcon, IndustrialIcon }